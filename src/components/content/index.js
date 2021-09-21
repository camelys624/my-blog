import React from "react"
import { navigate } from "gatsby"
import contentStyle from "./index.module.css"
import BusinessCard from "../business-card"
// import dayjs from "dayjs";

export default (props) => {
  let data = props.data
  data.allMarkdownRemark.edges.sort((a, b) => {
    return ((new Date(b.node.frontmatter.date)).getTime() - (new Date(a.node.frontmatter.date)).getTime())
  })

  function routeTo(route) {
    navigate(route)
  }

  return (
    <div className="content-container">
      {
        data.allMarkdownRemark.edges.map(({ node }) => (
          <div role="link" tabIndex="0"
               className={contentStyle.containerItem}
               onClick={() => {
                 routeTo(node.fields.slug)
               }}
               onKeyDown={() => {
               }} key={node.id}>
            {
              node.frontmatter.resume
                ?
                <BusinessCard/>
                :
                <>
                  <h3>
                    {node.frontmatter.title}{" "}
                    < span style={{ color: "#bbb" }}>- {node.frontmatter.date}</span>
                  </h3>
                  <p>{node.excerpt}</p>
                </>
            }
          </div>
        ))
      }
    </div>
  )
}

