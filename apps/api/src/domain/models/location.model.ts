import MainModel, { type MainNode } from '#models/main.model'
import type { Point } from '#utils/queryService'

export interface LocationNode extends MainNode {
  name?: string
  company_id?: number
  country_id?: number
  location?: Point
}

export default class LocationModel extends MainModel<LocationNode> {}
