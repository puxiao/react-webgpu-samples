import { useEffect, useRef, useState } from "react"
import BasePage from "@/components/base-page"
import useWebGPU from "@/hooks/useWebGPU"
import useCanvasSize from "@/hooks/useCanvasSize"
import DatGui, { DatButton, DatFolder, DatNumber } from "react-dat-gui"
import vert from '@/shaders/heart-shape/vert.wgsl'
import frag from '@/shaders/heart-shape/frag.wgsl'

interface GuiData {
    offsetRadian: number
    xRatio: number
    yRatio: number
    xMultiple: number
    yMultiple: number
    points: number
    r: number
    g: number
    b: number
    offsetX: number
    offsetY: number
}

const getHeartXYArr = (data: GuiData) => {

    const { offsetRadian, xRatio, yRatio, xMultiple, yMultiple, points, offsetX, offsetY } = data

    const radian = Math.PI * 2 / points

    const res: number[] = []
    let rad: number = 0
    for (let i = 0; i < points; i++) {
        rad = (radian + Math.PI / offsetRadian) * i
        res.push(xRatio * (xMultiple * Math.sin(rad) - Math.sin(xMultiple * rad)) + offsetX)
        res.push(yRatio * (yMultiple * Math.cos(rad) - Math.cos(yMultiple * rad)) + offsetY)
    }
    res.push(res[0], res[1])

    return res
}

let guiDataInit: GuiData = {
    offsetRadian: 4,
    xRatio: 0.1,
    yRatio: 0.24,
    xMultiple: 3,
    yMultiple: 2,
    points: 48,
    r: 1,
    g: 0,
    b: 0,
    offsetX: 0,
    offsetY: 0.1
}

const HeartShape = () => {
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

        const xyArr = getHeartXYArr(guiData)
        const vertexArray = new Float32Array(xyArr)

        const vertexBuffer = device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(vertexBuffer, 0, vertexArray)

        const colorArr = new Float32Array([
            guiData.r, guiData.g, guiData.b, 1.0
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
                    arrayStride: 2 * 4,
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x2'
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
                topology: 'line-strip'
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
        passEncoder.draw(xyArr.length / 2) // guiData.points + 1
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])

    }, [canvasSize, canvas, context, format, adapter, device, guiData])

    return (
        <BasePage title='heart shape - WebGPU'>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} tabIndex={0} />
            <DatGui data={guiData} onUpdate={handleGuiUpdate}>
                <DatNumber path='offsetRadian' label='offsetRadian' min={1} max={10} step={0.5} />
                <DatNumber path='xRatio' label='xRatio' min={0.01} max={0.3} step={0.01} />
                <DatNumber path='yRatio' label='yRatio' min={0.01} max={0.6} step={0.01} />
                <DatNumber path='xMultiple' label='xMultiple' min={1} max={4} step={0.1} />
                <DatNumber path='yMultiple' label='yMultiple' min={1} max={4} step={0.1} />
                <DatNumber path='points' label='points' min={4} max={128} step={2} />
                <DatButton onClick={() => setGuiData(guiDataInit)} label='Click restore defaults' />

                <DatFolder title='color' closed={false}>
                    <DatNumber path='r' label='R' min={0} max={1} step={0.01} />
                    <DatNumber path='g' label='G' min={0} max={1} step={0.01} />
                    <DatNumber path='b' label='B' min={0} max={1} step={0.01} />
                </DatFolder>

                <DatFolder title='offset' closed={false}>
                    <DatNumber path='offsetX' label='offsetX' min={-1} max={1} step={0.05} />
                    <DatNumber path='offsetY' label='offsetY' min={-1} max={1} step={0.05} />
                </DatFolder>
            </DatGui>
        </BasePage>
    )
}

export default HeartShape