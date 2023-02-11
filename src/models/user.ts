import Joi from "joi"
import { getDb } from "../utils/db"
import { hash, compare } from "bcrypt"
import { InvalidError, NotFound, UnauthorizedError, WrongPassword } from "../utils/errors"
import { JwtPayload, sign, verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

import { recoverPersonalSignature } from "eth-sig-util"
import { bufferToHex } from "ethereumjs-util"
import uuid from "uuid";

export const collectionName = "users"

export default class User {
    id?: string | null
    joinedAt?: Date
    walletAddress?: string
    nonce?: string

    constructor(id?: string | null, joinedAt?: Date, walletAddress?: string) {
        this.id = id
        this.joinedAt = joinedAt
        this.walletAddress = walletAddress
        this.nonce = uuid.v4();
    }

    async #validate(): Promise<User> {
        const schema = Joi.object({
            id: Joi.string().allow(null).optional(),
            joinedAt: Joi.date().default(() => new Date()),
            walletAddress: Joi.string().allow(null).optional()
        })
        let result = await schema.validateAsync(this)
        return result as User
    }

    static parse(req: any): User {
        return new User(
            req.id,
            req.joinedAt,
            req.walletAddress
        )
    }

    async updateNonce(): Promise<void> {
        let user = await this.#validate();
        let result = await getDb().collection(collectionName).updateOne({ walletAddress: user.walletAddress }, { $set: {
            nonce: uuid.v4(),
        }});
    }

    async save(): Promise<void> {
        let user = await this.#validate();
        delete user.id;
        let result = await getDb().collection(collectionName).insertOne(user);
        this.id = result.insertedId.toHexString();
    }

    async update(): Promise<void> {
        let user = await this.#validate();
        let result = await getDb().collection(collectionName).updateOne({ walletAddress: user.walletAddress }, { $set: {
            nonce: user.nonce,
        }});
        if (result.modifiedCount === 0) {
            throw new NotFound("User not found")
        }
    }

    async generateToken(): Promise<string> {
        if (!this.walletAddress) {
            throw new NotFound("User id not found")
        }
        let token = sign({
            walletAddress: this.walletAddress,
        }, process.env.jwtSecret || "secret", {
            expiresIn: "30d"
        })
        return token
    }

    async generateSigningMessage(): Promise<string> {
        let message = `
        Welcome to Where's My Network.\n\n
        Click "Sign" to sign in.\n\n
        Nonce: ${this.nonce}\n
        This request will not trigger a blockchain transaction or cost any gas fees.\n\n
        I accept the Where's My Network Terms of Service :\n
        https://wheresmy.network/tos
        `
        return message;
    }

    static async findUser(walletAddress: string): Promise<User | null> {
        let result = await getDb().collection(collectionName).findOne({ walletAddress: walletAddress });
        if (result) {
            return new User(
                result._id.toHexString(),
                result.joinedAt,
                result.walletAddress
            )
        }
        return null;
    }

    static async validateToken(token: string): Promise<string> {
        try {
            let decoded = verify(token, process.env.jwtSecret || "secret") as JwtPayload
            return decoded.id
        } catch (e) {
            throw new InvalidError("Invalid token")
        }
    }

    async validateSignature(signature: string): Promise<User | null> {
        if (signature) {
            let message = await this.generateSigningMessage();
            const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
            const recoveredAddress = recoverPersonalSignature({
                data: msgBufferHex,
                sig: signature,
            });
            if (recoveredAddress.toLowerCase() === this.walletAddress!.toLowerCase()) {
                delete this.nonce;
                return this;
            }
            return null;
        }
        return null;
    }

}