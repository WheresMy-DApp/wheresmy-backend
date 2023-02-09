import Joi from "joi"
import { getDb } from "../utils/db"
import { hash, compare } from "bcrypt"
import { InvalidError, NotFound, WrongPassword } from "../utils/errors"
import { JwtPayload, sign, verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

export const collectionName = "users"

export default class User {
    id?: string | null
    email: string
    password?: string
    createdAt?: Date
    walletAddress?: string

    constructor(email: string, password: string, id?: string | null, createdAt?: Date, walletAddress?: string) {
        this.id = id
        this.email = email
        this.password = password
        this.createdAt = createdAt
        this.walletAddress = walletAddress
    }

    async #validate(): Promise<User> {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
            id: Joi.string().allow(null).optional(),
            createdAt: Joi.date().default(() => new Date()),
            walletAddress: Joi.string().allow(null).optional()
        })
        let result = await schema.validateAsync(this)
        return result as User
    }

    static parse(req: any): User {
        return new User(
            req.email,
            req.password,
            req.id,
            req.createdAt,
            req.walletAddress
        )
    }

    async save(): Promise<void> {
        let user = await this.#validate();
        delete user.id;
        let hashedPassword = await hash(user.password!, parseInt(process.env.SALT_ROUNDS!));
        user.password = hashedPassword;
        let result = await getDb().collection(collectionName).insertOne(user);
        delete user.password;
        delete this.password;
        this.id = result.insertedId.toHexString();
    }

    async updatePassword(newPassword: string): Promise<void> {
        if (!this.id) {
            throw new NotFound("User id not found")
        }
        let hashedPassword = await hash(newPassword, parseInt(process.env.SALT_ROUNDS!))
        let result = await getDb().collection(collectionName).updateOne({
            _id: new ObjectId(this.id)
        }, {
            $set: {
                password: hashedPassword
            }
        })
        if (result.modifiedCount === 0) {
            throw new InvalidError("Password not updated")
        }
    }

    static async validatePassword(rawPassword: string, walletAddress: string): Promise<User> {
        let result = await this.findUsingKeyAndValue("walletAddress", walletAddress)
        if (result) {
            let user = result[0]
            let isValid = await compare(rawPassword, user.password!)
            if (isValid) {
                delete user.password
                return user
            } else {
                throw new WrongPassword("Wrong password")
            }
        } else {
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

    static async findUsingKeyAndValue(key: string, value: any): Promise<User[] | null> {
        let result = await getDb().collection(collectionName).find({ [key]: value }).toArray()
        if (result.length === 0) {
            return null
        } else {
            return result.map(user => new User(
                user.email,
                user.password,
                user._id.toHexString(),
                user.createdAt,
                user.walletAddress
            ))
        }
    }

    static async validateToken(token: string): Promise<string> {
        try {
            let decoded = verify(token, process.env.jwtSecret || "secret") as JwtPayload
            return decoded.id
        } catch (e) {
            throw new InvalidError("Invalid token")
        }
    }

}