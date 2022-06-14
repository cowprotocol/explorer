import { NodeSingular } from 'cytoscape'

export type CytoscapeLayouts = 'grid' | 'fcose' | 'breadthfirst' | 'cola' | 'dagre'

const defaultValues = {
  padding: 10, // padding used on fit
  animate: true,
}
export const layouts = {
  grid: {
    name: 'grid',
    position: function (node: NodeSingular): { row: number; col: number } {
      return { row: node.data('row'), col: node.data('col') }
    },
    fit: true, // whether to fit the viewport to the graph
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
    nodeDimensionsIncludeLabels: false,
    ...defaultValues,
  },
  fcose: {
    ...defaultValues,
    name: 'fcose',
    quality: 'proof',
    randomize: true,
    animationDuration: 1000,
    animationEasing: undefined,
    fit: true,
    nodeDimensionsIncludeLabels: false,
    uniformNodeDimensions: false,
    packComponents: true,
    step: 'all',
    /* spectral layout options */

    // False for random, true for greedy sampling
    samplingType: true,
    // Sample size to construct distance matrix
    sampleSize: 25,
    // Separation amount between nodes
    nodeSeparation: 75,
    // Power iteration tolerance
    piTol: 0.0000001,

    /* incremental layout options */

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: (): number => 44500,
    // Ideal edge (non nested) length
    idealEdgeLength: (): number => 300,
    // Divisor to compute edge forces
    edgeElasticity: (): number => 0.9,
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 0.1,
    // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
    numIter: 2500,
    // For enabling tiling
    tile: true,
    // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingVertical: 10,
    // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity force (constant)
    gravity: 0.25,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.0,
    // Gravity range (constant)
    gravityRange: 3.8,
    // Initial cooling factor for incremental layout
    initialEnergyOnIncremental: 0.3,

    /* constraint options */

    // Fix desired nodes to predefined positions
    // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
    fixedNodeConstraint: undefined,
    // Align desired nodes in vertical/horizontal direction
    // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
    alignmentConstraint: undefined,
    // Place two nodes relatively in vertical/horizontal direction
    // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
    relativePlacementConstraint: undefined,
  },
  breadthfirst: {
    ...defaultValues,
    name: 'breadthfirst',
  },
  cola: {
    ...defaultValues,
    name: 'cola',
    maxSimulationTime: 40000,
    handleDisconnected: true,
    avoidOverlap: true,
    idealEdgeLength: 500,
    centerGraph: false,
  },
  dagre: {
    ...defaultValues,
    name: 'dagre',
  },
}

export const layoutsNames = Object.keys(layouts)
