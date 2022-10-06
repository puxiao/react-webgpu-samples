import { useEffect, useRef } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"

import vert from '@/shaders/simple-triangle/vert.wgsl'
import frag from '@/shaders/simple-triangle/frag.wgsl'


const SimpleTriangle = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvasSize = useCanvasSize()
    const { adapter, device, canvas, context, format } = useWebGPU(canvasRef.current)

    useEffect(() => {
        if (!canvas || !context || !adapter || !device) return

        const canvsConfig: GPUCanvasConfiguration = {
            device,
            format,
            alphaMode: 'opaque'
        }
        context.configure(canvsConfig)


        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: vert
                }),
                entryPoint: 'main'
            },
            fragment: {
                module: device.createShaderModule({
                    code: frag
                }),
                entryPoint: 'main',
                targets: [{ format }]
            },
            primitive: {
                topology: 'triangle-strip'
            }
        })
        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        }
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
        passEncoder.setPipeline(pipeline)
        passEncoder.draw(3, 1, 0, 0)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])

    }, [canvasSize, canvas, context, format, adapter, device])

    return (
        <BasePage title='simple triangle - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
        </BasePage>
    )
}

export default SimpleTriangle
