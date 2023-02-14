import { Db, MongoClient } from "mongodb"

let db: Db

export const establishConnection = async (): Promise<void> => {
    try {
        const url = process.env.mongoUrl
        const dbName = process.env.dbName
        if (url == null || url == "" || dbName == null || dbName == "") {
            throw new Error("Mongo URL or DB Name not set")
        }
        const client = new MongoClient(
            url,
            {
                minPoolSize: 10,
                maxPoolSize: 25
            }
        )
        client.connect().then(clientConnection => {
            console.log("Database connection is now active!")
            db = clientConnection.db(dbName)
            db.createIndex("users", { walletAddress: 1 }, { unique: true })
        })
    } catch (err) {
        throw err
    }
}

export const getDb = (): Db => {
    if (db) {
        return db
    } else {
        throw new Error("Db connection is not active!")
    }
}