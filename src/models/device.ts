import Joi from "joi"
import { getDb } from "../utils/db"
import { InvalidError, NotFoundError, UnauthorizedError } from "../utils/errors"
import { JwtPayload, sign, verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

import { recoverPersonalSignature } from "eth-sig-util"
import { bufferToHex } from "ethereumjs-util"
import { v4 as uuidv4 } from 'uuid';

export const collectionName = "devices"

export default class Device {
    id?: string | null
    createdAt?: Date
    owner?: string
    deviceNickname?: string
    isLost?: boolean
    deviceHash?: string

    constructor(id?: string | null, createdAt?: Date, owner?: string, deviceNickname?: string, isLost?: boolean, deviceHash?: string) {
        this.id = id
        this.createdAt = createdAt
        this.owner = owner
        this.deviceNickname = deviceNickname
        this.isLost = isLost;
        this.deviceHash = deviceHash;
    }

    async #validate(): Promise<Device> {
        const schema = Joi.object({
            id: Joi.string().allow(null).optional(),
            createdAt: Joi.date().default(() => new Date()),
            owner: Joi.string(),
            deviceNickname: Joi.string(),
            isLost: Joi.boolean().default(false),
            deviceHash: Joi.string(),
        })
        let result = await schema.validateAsync(this)
        return result as Device
    }

    static parse(req: any): Device {
        return new Device(
            req.id,
            new Date(),
            req.owner,
            req.deviceNickname,
            req.isLost || false,
            req.deviceHash
        )
    }

    async save(): Promise<void> {
        let device = await this.#validate();
        delete device.id;
        let result = await getDb().collection(collectionName).insertOne(device);
        this.id = result.insertedId.toHexString();
    }

    async update(): Promise<void> {
        let device = await this.#validate();
        if (device.id != null) {
            let result = await getDb().collection(collectionName).updateOne({ _id: new ObjectId(device.id) }, {
                $set: {
                    deviceNickname: device.deviceNickname,
                    isLost: device.isLost,
                }
            });
        }
    }

    static async findByKeyValue(key: string, value: string): Promise<Device[]> {
        let result = await getDb().collection(collectionName).find({ [key]: value }).toArray();
        if (result.length == 0) {
            throw new NotFoundError("Device not found");
        }
        let response = result.map((device) => {
            return new Device(
                device._id.toHexString(),
                device.createdAt,
                device.owner,
                device.deviceNickname,
                device.isLost,
                device.deviceHash
            )
        })
        return response;
    }

}