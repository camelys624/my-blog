import React from "react";
import { Link } from "gatsby"
import contentStyle from './index.module.css';
import dayjs from "dayjs";

export default (props) => {
  let data = props.data;
  data.allMarkdownRemark.edges.sort((a, b) => {
    return ((new Date(b.node.frontmatter.date)).getTime() - (new Date(a.node.frontmatter.date)).getTime());
  })

  return (
    <div className="content-container">
      {
        data.allMarkdownRemark.edges.map(({ node }) => (
          <div className={contentStyle.containerItem} key={node.id}>
            <Link to={node.fields.slug}>
              <h3>
                {node.frontmatter.title}{" "}
                <span style={{color: '#bbb'}}>- {dayjs(node.frontmatter.date).format('YYYY-MM-DD')}</span>
              </h3>
              <p>{node.excerpt}</p>
            </Link>
          </div>
        ))
      }
    </div>
  )
}

