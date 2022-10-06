import { useEffect, useState } from "react"

interface CanvasSize {
    width: number
    height: number
}

const asideWidth = 280 // aside width is 280px

const useCanvasSize = () => {
    const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1, height: 1 })
    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: document.body.clientWidth * window.devicePixelRatio - asideWidth,
                height: document.body.clientHeight * window.devicePixelRatio
            })
        }
        handleResize()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return canvasSize

}
export default useCanvasSize