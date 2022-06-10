import { NodeSingular } from 'cytoscape'

export type CytoscapeLayouts = 'grid' | 'fcose' | 'breadthfirst' | 'cola' | 'dagre'

export const layouts = {
  grid: {
    name: 'grid',
    position: function (node: NodeSingular): { row: number; col: number } {
      return { row: node.data('row'), col: node.data('col') }
    },
    fit: true, // whether to fit the viewport to the graph
    padding: 10, // padding used on fit
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
    nodeDimensionsIncludeLabels: false,
    animate: true,
  },
  fcose: {
    name: 'fcose',
    animate: true,
    quality: 'proof',
    fit: true,
    nodeRepulsion: 4500,
  },
  breadthfirst: {
    name: 'breadthfirst',
    animate: true,
  },
  cola: {
    name: 'cola',
    animate: true,
    maxSimulationTime: 40000,
  },
  dagre: {
    name: 'dagre',
    animate: true,
  },
}

export const layoutsNames = Object.keys(layouts)
