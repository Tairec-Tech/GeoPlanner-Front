declare module 'leaflet-routing-machine' {
  import { Control } from 'leaflet'

  interface RoutingControlOptions {
    waypoints: any[]
    routeWhileDragging?: boolean
    showAlternatives?: boolean
    fitSelectedRoutes?: boolean
    lineOptions?: {
      styles?: Array<{
        color?: string
        opacity?: number
        weight?: number
      }>
    }
  }

  interface RoutingControl extends Control {
    new(options?: RoutingControlOptions): RoutingControl
    addTo(map: any): RoutingControl
  }

  const routingControl: RoutingControl
  export default routingControl
}
