interface RGB {
    r: number
    g: number
    b: number
}

export type colorStr = `#${string}`

export const colorToRGB = (color: colorStr): RGB => {
    const r: number = parseInt(color.substring(1, 3), 16)
    const g: number = parseInt(color.substring(3, 5), 16)
    const b: number = parseInt(color.substring(5, 7), 16)

    return { r, g, b }
}

export const colorToNormalizeRGB = (color: colorStr): RGB => {
    const res: RGB = colorToRGB(color)
    res.r = res.r / 255
    res.g = res.g / 255
    res.b = res.b / 255
    return res
}