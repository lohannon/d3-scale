# d3-scale

An interactive UI tool to allow users to select weights for categories on a scale of 100.  The tool uses the d3.js library to render the sliding action.  The tool is demoed in a Ruby on Rails application using static sample data.

# Getting Started

You can run this code locally, and navigate to:

```
localhost:3000/home/index
```
  
The demo shows two different weight scale instances, which highlight the customizability of the tool.  d3-scale can customize the legend, color scale, and sizes of the tool.  d3-scale also supports multiple instances of the tool on a single page. 

To adjust the weighted values on a scale, drag the verticle bar for each category to the desired percentage.

![Alt text](https://github.com/lohannon/d3-scale/blob/master/d3-scale-demo.png "d3-scale Demo")

# Relevant Files
1. The tool: /app/assets/javascripts/weightscale.js
2. The home page that instantiates the tool with static data: /app/views/home/index.html.erb
