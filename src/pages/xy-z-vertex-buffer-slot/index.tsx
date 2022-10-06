import { useEffect, useRef } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"

import vert from '@/shaders/xy-z-vertex-buffer-slot/vert.wgsl'
import frag from '@/shaders/xy-z-vertex-buffer-slot/frag.wgsl'

const XYZVertexBufferSlot = () => {
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

        //const xyVertexArray = new Float32Array([ 0.0, 0.5, -0.5, -0.5, 0.5, -0.5 ])

        //const zVertexArray = new Float32Array([0.0,0.0,0.0])

        const xyzVertexArray = new Float32Array([
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ])

        //const xyVertexBuffer = device.createBuffer({
        //     size: xyVertexArray.byteLength, // xyVertexArray.length * 4
        //     usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        // })

        //const zVertexBuffer = device.createBuffer({
        //     size: zVertexArray.byteLength, // zVertexArray.length * 4
        //     usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        // })

        const xyzVertexBuffer = device.createBuffer({
            size: xyzVertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        // device.queue.writeBuffer(xyVertexBuffer, 0, xyVertexArray)
        // device.queue.writeBuffer(zVertexBuffer, 0, zVertexArray)
        device.queue.writeBuffer(xyzVertexBuffer, 0, xyzVertexArray)

        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: vert
                }),
                entryPoint: 'main',
                // buffers: [
                //     {
                //         arrayStride: 2 * 4,
                //         attributes: [{
                //             shaderLocation: 0,
                //             offset: 0,
                //             format: 'float32x2'
                //         }]
                //     },
                //     {
                //         arrayStride: 1 * 4,
                //         attributes: [{
                //             shaderLocation: 1,
                //             offset: 0,
                //             format: 'float32'
                //         }]
                //     }
                // ]
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2'
                            },
                            {
                                shaderLocation: 1,
                                offset: 2 * 4,
                                format: 'float32'
                            }
                        ]
                    }
                ]
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
        // passEncoder.setVertexBuffer(0, xyVertexBuffer)
        // passEncoder.setVertexBuffer(1, zVertexBuffer)
        passEncoder.setVertexBuffer(0, xyzVertexBuffer)
        passEncoder.draw(3)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])

    }, [canvasSize, canvas, context, format, adapter, device])

    return (
        <BasePage title='xy-z vertex buffer slot - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
        </BasePage>
    )
}

export default XYZVertexBufferSlot