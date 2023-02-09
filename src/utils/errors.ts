export class WrongPassword extends Error {
    constructor(msg : string) {
        super(msg)

        Object.setPrototypeOf(this, WrongPassword.prototype)
    }
}

export class NotFound extends Error {
    constructor(msg : string) {
        super(msg)

        Object.setPrototypeOf(this, NotFound.prototype)
    }
}

export class InvalidError extends Error {
    constructor(msg : string) {
        super(msg)

        Object.setPrototypeOf(this, InvalidError.prototype)
    }
}