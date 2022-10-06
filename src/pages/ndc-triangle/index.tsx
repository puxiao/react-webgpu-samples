import { useEffect, useRef } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"
import { mat4, vec3 } from 'gl-matrix'

import vert from '@/shaders/ndc-triangle/vert.wgsl'
import frag from '@/shaders/ndc-triangle/frag.wgsl'

const NDCTriangle = () => {
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
            0.0, 0.5, 1,
            -0.5, -0.5, 0,
            0.5, -0.5, 0
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


        //创建模型矩阵
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0.0, 0.0, -10.0))
        //mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.5, 0.5, 0.5))
        mat4.rotate(modelMatrix, modelMatrix, Math.PI / 4, vec3.fromValues(0.0, 0.0, 1.0))

        //创建视图矩阵
        const viewMatrix = mat4.create()
        //mat4.lookAt(viewMatrix, vec3.fromValues(0.0, 0.0, 0.5), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0))

        //创建投影矩阵
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100)

        //创建 MVP 矩阵
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        const matrixBuffer = device.createBuffer({
            size: mvpMatrix.length * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(matrixBuffer, 0, mvpMatrix as Float32Array)

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
                },
                {
                    binding: 1,
                    resource: {
                        buffer: matrixBuffer
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
        <BasePage title='ndc triangle - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
        </BasePage>
    )
}

export default NDCTriangle