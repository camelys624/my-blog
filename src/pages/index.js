import React, { useEffect } from "react"
import Header from "../components/header"
import Content from "../components/content"
import Car3D from "../components/car"
// import {allComponents, provideFASTDesignSystem} from "@microsoft/fast-components"
// import { CustomCard } from "../components/web-component-card/index"
import {initCustomCard} from "../components/web-component-card"
import { graphql } from "gatsby"
import 'highlight.js/styles/base16/one-light.min.css'

initCustomCard()


export default function Home({ data }) {
  useEffect(() => {
    if ('paintWorklet' in CSS) {
      CSS.paintWorklet.addModule('./css-houdini/huiwen-border.js');
    }
  },[])
  return (
    <div>
      <Header/>
      <Car3D/>
      <Content data={data}/>
    </div>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            resume
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
