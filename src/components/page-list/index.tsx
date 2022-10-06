import Link from "next/link"
import { useRouter } from "next/router"

interface PageListItem {
    title: string
    pageURL: string
    githubURL: string
}

const baseGithubURL = 'https://github.com/puxiao/react-webgpu-samples/blob/main/src/pages/'

const asideData: PageListItem[] = [
    {
        title: 'simple diamond',
        pageURL: '/simple-diamond',
        githubURL: `${baseGithubURL}/simple-diamond/index.tsx`
    },
    {
        title: 'color interpolation',
        pageURL: '/color-interpolation',
        githubURL: `${baseGithubURL}/color-interpolation/index.tsx`
    },
    {
        title: 'ndc triangle',
        pageURL: '/ndc-triangle',
        githubURL: `${baseGithubURL}/ndc-triangle/index.tsx`
    },
    {
        title: 'heart shape',
        pageURL: '/heart-shape',
        githubURL: `${baseGithubURL}/heart-shape/index.tsx`
    },
    {
        title: 'frag bind group',
        pageURL: '/frag-bind-group',
        githubURL: `${baseGithubURL}/frag-bind-group/index.tsx`
    },
    {
        title: 'xy-z vertex buffer slot',
        pageURL: '/xy-z-vertex-buffer-slot',
        githubURL: `${baseGithubURL}/xy-z-vertex-buffer-slot/index.tsx`
    },
    {
        title: 'vertex buffer slot',
        pageURL: '/vertex-buffer-slot',
        githubURL: `${baseGithubURL}/vertex-buffer-slot/index.tsx`
    },
    {
        title: 'simple triangle',
        pageURL: '/simple-triangle',
        githubURL: `${baseGithubURL}/simple-triangle/index.tsx`
    }
]

const PageList = () => {

    const router = useRouter()

    const getColor: (linkData: PageListItem) => string = ({ pageURL }) => {

        if (router.route === pageURL || (pageURL === asideData[0].pageURL && router.route === '/')) {
            return 'red'
        }

        return '#000'
    }

    return (
        <aside>
            <h1>React WebGPU Samples</h1>
            <a href='https://github.com/puxiao/react-webgpu-samples' target='_blank' rel='noreferrer' >Github</a>
            <hr />
            <ul>
                {
                    asideData.map((item) => {
                        return (
                            <li key={item.pageURL} style={{ color: getColor(item) }}>
                                <Link href={item.pageURL}>{item.title}</Link>
                                <a href={item.githubURL} target='_blank' rel='noreferrer'>src</a>
                            </li>
                        )
                    })
                }
            </ul>
        </aside>
    )
}

export default PageList