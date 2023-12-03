import React from "react"
import { navigate } from "gatsby"
import "./index.module.css"
// import BusinessCard from "../business-card"
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
        data.allMarkdownRemark.edges.map(({ node }) => node.frontmatter.resume
          ? <custom-card role="link" tabIndex="0" onClick={() => {routeTo(node.fields.slug)}} onKeyDown={() => {}} key={node.id}>
            <h1 slot="person-name" data-job="front-end developer" className="personName">杨升</h1>
            <span slot="phone">15922835412</span>
            <span slot="email">camel_yangz@163.com</span>
            <img slot="wechat-pic" src="./mmqrcode1631632704399.png" alt="wechat"/>
            <img slot="twitter-pic" src="./20210914_232019.jpg" alt="twitter"/>
          </custom-card>
          : <div role="link" tabIndex="0"
               className="containerItem"
               onClick={() => {
                 routeTo(node.fields.slug)
               }}
               onKeyDown={() => {
               }} key={node.id}>
                  <h3>
                    {node.frontmatter.title}{" "}
                    < span style={{ color: "#bbb" }}>- {node.frontmatter.date}</span>
                  </h3>
                  <p>{node.excerpt}</p>
          </div>
        )
      }
    </div>
  )
}

