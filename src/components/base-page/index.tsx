import { ReactNode } from 'react'
import Head from 'next/head'
import PageList from '@/components/page-list'

interface BasePageProps {
    title?: string
    children?: ReactNode
}

const BasePage = ({ title = 'Hello WebGPU', children = [] }: BasePageProps) => {
    return (
        <div className='container'>
            <Head>
                <title>{title}</title>
                <meta name="description" content="React + Next.js + TypeScript + WebGPU Samples" />
                <link rel="icon" href="/favicon.ico" />
                <meta httpEquiv="origin-trial"
                    content="AkEPHJci3CBOEYw5CW/l/KMoPot8c2RWobffNrWJI9rBsqmMdR/PHFJTYr3U4PCcIH5QeGFj9667RlF4Aq2w8Q4AAAByeyJvcmlnaW4iOiJodHRwczovL3JlYWN0LXdlYmdwdS1zYW1wbGVzLnZlcmNlbC5hcHA6NDQzIiwiZmVhdHVyZSI6IldlYkdQVSIsImV4cGlyeSI6MTY3NTIwOTU5OSwiaXNTdWJkb21haW4iOnRydWV9"></meta>
            </Head>
            <PageList />
            <main className='main'>
                {
                    children
                }
            </main>
        </div>
    )
}

export default BasePage