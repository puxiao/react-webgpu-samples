import { vec3 } from "gl-matrix"
import random from "./random"

const randomVec3 = () => {
    return vec3.fromValues(random(), random(), random())
}

export default randomVec3