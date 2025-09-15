import type { LocationNode } from '#models/location.model'
import { type DbService, MainService } from '#services/main.service'

export class LocationService extends MainService<LocationNode> {
  static TABLE_NAME = 'locations'

  constructor(db: DbService) {
    super(db, LocationService.TABLE_NAME, [
      { key: 'id', type: 'number' },
      { key: 'company_id', type: 'number' },
      { key: 'country_id', type: 'number' },
      { key: 'name', type: 'string' },
      { key: 'location', type: 'Point' },
      { key: 'created_at', type: 'string' },
      { key: 'updated_at', type: 'string' },
    ])
  }
}
