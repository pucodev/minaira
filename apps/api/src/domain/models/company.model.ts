import MainModel, { type MainNode } from '#models/main.model'

export interface CompanyNode extends MainNode {
  name?: string
  country_id?: number
}

export default class CompanyModel extends MainModel<CompanyNode> {}
