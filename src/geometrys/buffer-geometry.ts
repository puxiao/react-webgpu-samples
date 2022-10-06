import { v4 as uuidv4 } from 'uuid'
let _inside_id = 0

class BufferGeometry {

    private _id: number
    private _uuid: string
    protected _type: string
    protected _vertices: Float32Array
    protected _colors: Float32Array

    public name: string

    constructor() {
        this._id = _inside_id++
        this._uuid = uuidv4()

        this._type = "BufferGeometry"

        this.name = ''
        this._vertices = new Float32Array()
        this._colors = new Float32Array()
    }

    public get id(): number {
        return this._id
    }

    public get uuid(): string {
        return this._uuid
    }

    public get type(): string {
        return this._type
    }

    public get vertices(): Float32Array {
        return this._vertices
    }

    public get colors(): Float32Array {
        return this._colors
    }
}

export default BufferGeometry