import re

# Add document endpoints to admin.controller.ts
with open('/root/gastroprime/backend/src/admin/admin.controller.ts', 'r') as f:
    ctrl = f.read()

# Remove existing closing brace line
if ctrl.strip().endswith('}'):
    # Find the last '}' that closes the class
    # Simple approach: insert before the last line
    pass

# Add document endpoints before the closing }
new_endpoints = """
  @Post("companies/:id/documents")
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const companyId = req.params.id
        const dir = join(process.cwd(), 'uploads', 'company-docs', companyId)
        mkdirSync(dir, { recursive: true })
        cb(null, dir)
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname)
        const name = `${Date.now()}-${file.originalname.replace(extname(file.originalname), '').replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f]/g, '_').slice(0, 50)}${ext}`
        cb(null, name)
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  async uploadCompanyDocument(@Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadCompanyDocument(id, file)
  }

  @Get("companies/:id/documents")
  async listCompanyDocuments(@Param("id") id: string) {
    return this.adminService.listCompanyDocuments(id)
  }

  @Delete("companies/:id/documents/:filename")
  async deleteCompanyDocument(@Param("id") id: string, @Param("filename") filename: string) {
    return this.adminService.deleteCompanyDocument(id, filename)
  }
"""

# Insert before the last closing brace of the controller class
ctrl = ctrl.strip()
if ctrl.endswith('}'):
    ctrl = ctrl[:-1].strip() + new_endpoints + '\n}'

with open('/root/gastroprime/backend/src/admin/admin.controller.ts', 'w') as f:
    f.write(ctrl)
print('Controller updated')
