import React, { Component } from "react"
import hljs from "highlight.js"
import { graphql } from "gatsby"
import Header from "../header/index"

import postStyle from "./blogPost.module.css"

class Content extends Component {
  constructor(props) {
    super(props)
    this.props = props
  }

  componentDidMount() {
    this.renderCode();
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log('11')
  //   hljs.initHighlighting();
  // }

  renderCode() {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightBlock(block);
    })
  }

  render() {
    const post = this.props.data.markdownRemark
    return (
      <>
        <Header data={{opacity: 1}}/>
        <div className={postStyle.contentContainer}>
          <h1>{post.frontmatter.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
        </div>
      </>
    )
  }
}

export default Content

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
