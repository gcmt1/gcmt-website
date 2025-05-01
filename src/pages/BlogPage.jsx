import React from "react";
import "../styles/AboutPage.css";

const BlogPage = () => {
  const blogPosts = [
    {
      title: "5 Benefits of Charcoal Toothpaste",
      excerpt: "Discover how activated charcoal naturally whitens teeth and fights plaque.",
    },
    {
      title: "Why Ayurveda is the Future of Health",
      excerpt: "Ancient herbs and modern science combine to create powerful wellness solutions.",
    },
    {
      title: "Fluoride-Free Toothpaste: A Smart Choice",
      excerpt: "Learn why many health-conscious individuals are switching to fluoride-free options.",
    },
  ];

  return (
    <div className="blogpage-container">
      <h1>Our Blog</h1>
      <div className="blogpage-posts">
        {blogPosts.map((post, index) => (
          <div className="blogpage-card" key={index}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <button className="blogpage-readmore">Read More</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
