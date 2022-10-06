import { useEffect, useRef, useState } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"
import { mat4, vec3 } from 'gl-matrix'
import DatGui, { DatColor, DatFolder, DatNumber } from 'react-dat-gui'
import { colorStr, colorToNormalizeRGB } from '@/utils/colorToRGB'

import vert from '@/shaders/color-interpolation/vert.wgsl'
import frag from '@/shaders/color-interpolation/frag.wgsl'

interface GuiData {
    topColor: colorStr
    leftColor: colorStr
    rightColor: colorStr
    scale: number
    rotate: number
}

const guiDataInit: GuiData = {
    topColor: '#ff0000',
    leftColor: '#00ff00',
    rightColor: '#0000ff',
    scale: 1,
    rotate: 0
}

const ColorInterpolation = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvasSize = useCanvasSize()
    const { adapter, device, canvas, context, format } = useWebGPU(canvasRef.current)
    const [guiData, setGuiData] = useState<GuiData>(guiDataInit)

    const handleGuiUpdate = (newData: GuiData) => {
        setGuiData(newData)
    }

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
            0.5, -0.5, 0.0,
        ])

        const vertexBuffer = device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(vertexBuffer, 0, vertexArray)

        const topRGB = colorToNormalizeRGB(guiData.topColor)
        const leftRGB = colorToNormalizeRGB(guiData.leftColor)
        const rightRGB = colorToNormalizeRGB(guiData.rightColor)

        const colorArr = new Float32Array([
            topRGB.r, topRGB.g, topRGB.b,
            leftRGB.r, leftRGB.g, leftRGB.b,
            rightRGB.r, rightRGB.g, rightRGB.b
        ])

        const colorBuffer = device.createBuffer({
            size: colorArr.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(colorBuffer, 0, colorArr)


        //创建模型矩阵
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0.0, 0.0, -2.0))
        mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(guiData.scale, guiData.scale, guiData.scale))
        mat4.rotate(modelMatrix, modelMatrix, Math.PI * guiData.rotate / 180, vec3.fromValues(0.0, 0.0, 1.0))

        //创建视图矩阵
        const viewMatrix = mat4.create()
        //mat4.lookAt(viewMatrix, vec3.fromValues(0.0, 0.0, 1.0), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0))

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
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3'
                            }
                        ]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 1,
                                offset: 0,
                                format: 'float32x3'
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

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
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
        passEncoder.setVertexBuffer(1, colorBuffer)
        passEncoder.setBindGroup(0, bindGroup)
        passEncoder.draw(3)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])

    }, [canvasSize, canvas, context, format, adapter, device, guiData])

    return (
        <BasePage title='color interpolation - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
            <DatGui data={guiData} onUpdate={handleGuiUpdate}>
                <DatColor path='topColor' label='topColor' />
                <DatColor path='leftColor' label='leftColor' />
                <DatColor path='rightColor' label='rightColor' />
                <DatFolder title="transform" closed={false}>
                    <DatNumber path='scale' label='scale' min={0.1} max={2} step={0.1} />
                    <DatNumber path='rotate' label='rotate' min={0} max={360} step={1} />
                </DatFolder>
            </DatGui>
        </BasePage>
    )
}

export default ColorInterpolation