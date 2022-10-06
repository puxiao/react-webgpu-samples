import { useEffect, useRef } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"

import vert from '@/shaders/frag-bind-group/vert.wgsl'
import frag from '@/shaders/frag-bind-group/frag.wgsl'

const FragBindGroup = () => {
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

        const vertexArray = new Float32Array([
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ])

        const vertexBuffer = device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(vertexBuffer, 0, vertexArray)

        const colorArr = new Float32Array([
            1.0, 0.0, 0.0, 1.0
        ])

        const colorBuffer = device.createBuffer({
            size: colorArr.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(colorBuffer, 0, colorArr)

        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: vert
                }),
                entryPoint: 'main',
                buffers: [{
                    arrayStride: 3 * 4,
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3'
                    }]
                }]
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

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: colorBuffer
                    }
                }
            ]
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
        passEncoder.setVertexBuffer(0, vertexBuffer)
        passEncoder.setBindGroup(0, bindGroup)
        passEncoder.draw(3)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])

    }, [canvasSize, canvas, context, format, adapter, device])

    return (
        <BasePage title='frag bind group - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
        </BasePage>
    )
}

export default FragBindGroup