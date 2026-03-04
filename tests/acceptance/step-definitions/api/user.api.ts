import request, { type Response } from 'supertest'

type AppProvider = () => Parameters<typeof request>[0]

export class UserAcceptanceApi {
  private readonly usersBasePath = '/api/v1/users'

  public constructor(private readonly appProvider: AppProvider) {}

  public async create(payload: Record<string, unknown>): Promise<Response> {
    return await request(this.appProvider()).post(this.usersBasePath).send(payload)
  }

  public async getById(userId: string): Promise<Response> {
    return await request(this.appProvider()).get(`${this.usersBasePath}/${userId}`)
  }

  public async list(query = ''): Promise<Response> {
    return await request(this.appProvider()).get(`${this.usersBasePath}${query}`)
  }

  public async update(userId: string, payload: Record<string, unknown>): Promise<Response> {
    return await request(this.appProvider()).patch(`${this.usersBasePath}/${userId}`).send(payload)
  }

  public async delete(userId: string): Promise<Response> {
    return await request(this.appProvider()).delete(`${this.usersBasePath}/${userId}`)
  }

  public async createDefault(name: string, email: string): Promise<string> {
    const response = await this.create({
      name,
      email,
      password: 'SecurePass123!',
    })

    return response.body.id as string
  }
}
