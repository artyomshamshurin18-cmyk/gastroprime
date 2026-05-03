# Add document methods to admin.service.ts
with open('/root/gastroprime/backend/src/admin/admin.service.ts', 'r') as f:
    svc = f.read()

# Insert new methods before the final closing '}'
new_methods = '''
  async uploadCompanyDocument(companyId: string, file: Express.Multer.File) {
    const { originalname, filename, size, mimetype } = file
    const doc = await this.prisma.companyDocument.create({
      data: {
        companyId,
        name: originalname,
        filename: filename,
        size: size,
        mimeType: mimetype,
      },
    })
    return doc
  }

  async listCompanyDocuments(companyId: string) {
    return this.prisma.companyDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteCompanyDocument(companyId: string, docId: string) {
    const doc = await this.prisma.companyDocument.findFirst({
      where: { id: docId, companyId },
    })
    if (!doc) {
      throw new NotFoundException('Документ не найден')
    }
    // Delete file
    const filePath = path.join(process.cwd(), 'uploads', 'company-docs', companyId, doc.filename)
    try { fs.unlinkSync(filePath) } catch {}
    // Delete from DB
    await this.prisma.companyDocument.delete({ where: { id: docId } })
    return { deleted: true }
  }
'''

svc = svc.strip()
if svc.endswith('}'):
    svc = svc[:-1].strip() + new_methods + '\n}'

with open('/root/gastroprime/backend/src/admin/admin.service.ts', 'w') as f:
    f.write(svc)
print('Service updated')
