import slugify from 'slugify'

import MainModel, { type MainNode } from '#models/main.model'
import { ApiError } from '#utils/errors'

export interface CompanyNode extends MainNode {
  name?: string
  country_id?: number
  slug?: string
}

export default class CompanyModel extends MainModel<CompanyNode> {
  static buildCreateCompany(name: string, slug: string) {
    if (!name || !slug) {
      throw new ApiError('COMPANIES_CREATE_ALL_FIELDS_REQUIRED')
    }

    const company = new CompanyModel({ name, slug })
    company.cleanData()
    return company
  }

  static generateSlug(name: string) {
    return slugify(name.trim(), {
      lower: true,
      strict: true,
      trim: true,
    })
  }

  cleanData() {
    if (this.node.name) {
      this.node.name = this.node.name.trim()
    }

    if (this.node.slug) {
      this.node.slug = CompanyModel.generateSlug(this.node.slug)
    }
  }
}
