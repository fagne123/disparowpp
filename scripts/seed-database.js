const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URI = 'mongodb://admin:admin@206.183.130.252:27017/disparaifagne1?authSource=admin'

// Schemas
const CompanySchema = new mongoose.Schema({
  name: String,
  email: String,
  status: { type: String, default: 'approved' },
  maxInstances: { type: Number, default: 5 },
  trialEndDate: Date
}, { timestamps: true, collection: 'companies' })

const UserSchema = new mongoose.Schema({
  companyId: String,
  role: { type: String, default: 'company_admin' },
  name: String,
  email: String,
  password: String
}, { timestamps: true, collection: 'users' })

const WhatsAppInstanceSchema = new mongoose.Schema({
  companyId: String,
  name: String,
  phoneNumber: String,
  status: { type: String, default: 'disconnected' },
  sessionData: mongoose.Schema.Types.Mixed,
  proxyConfig: mongoose.Schema.Types.Mixed,
  lastActivity: Date
}, { timestamps: true, collection: 'whatsapp_instances' })

const ContactSchema = new mongoose.Schema({
  companyId: String,
  phoneNumber: String,
  name: String,
  customField1: String,
  customField2: String,
  customField3: String,
  customField4: String
}, { timestamps: true, collection: 'contacts' })

// Models
const Company = mongoose.model('Company', CompanySchema)
const User = mongoose.model('User', UserSchema)
const WhatsAppInstance = mongoose.model('WhatsAppInstance', WhatsAppInstanceSchema)
const Contact = mongoose.model('Contact', ContactSchema)

async function seedDatabase() {
  try {
    console.log('🔌 Conectando ao MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado ao MongoDB!')

    // Clear existing data
    console.log('🧹 Limpando dados existentes...')
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      WhatsAppInstance.deleteMany({}),
      Contact.deleteMany({})
    ])

    // Create Super Admin Company
    console.log('🏢 Criando empresa Super Admin...')
    const superAdminCompany = new Company({
      name: 'DisparoWPP Admin',
      email: 'admin@disparowpp.com',
      status: 'approved',
      maxInstances: 999,
      trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    })
    await superAdminCompany.save()

    // Create Super Admin User
    console.log('👤 Criando usuário Super Admin...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const superAdminUser = new User({
      companyId: superAdminCompany._id.toString(),
      role: 'super_admin',
      name: 'Super Admin',
      email: 'admin@disparowpp.com',
      password: hashedPassword
    })
    await superAdminUser.save()

    // Create Test Company
    console.log('🏢 Criando empresa de teste...')
    const testCompany = new Company({
      name: 'Empresa Teste LTDA',
      email: 'teste@empresa.com',
      status: 'approved',
      maxInstances: 10,
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    await testCompany.save()

    // Create Test User
    console.log('👤 Criando usuário de teste...')
    const testUserPassword = await bcrypt.hash('teste123', 12)
    const testUser = new User({
      companyId: testCompany._id.toString(),
      role: 'company_admin',
      name: 'Usuário Teste',
      email: 'teste@empresa.com',
      password: testUserPassword
    })
    await testUser.save()

    // Create Test WhatsApp Instances
    console.log('📱 Criando instâncias WhatsApp de teste...')
    const instances = [
      {
        companyId: testCompany._id.toString(),
        name: 'WhatsApp Principal',
        phoneNumber: '+5511999999999',
        status: 'connected',
        lastActivity: new Date()
      },
      {
        companyId: testCompany._id.toString(),
        name: 'WhatsApp Secundário',
        phoneNumber: '+5511888888888',
        status: 'disconnected',
        lastActivity: new Date()
      }
    ]

    for (const instanceData of instances) {
      const instance = new WhatsAppInstance(instanceData)
      await instance.save()
    }

    // Create Test Contacts
    console.log('📞 Criando contatos de teste...')
    const contacts = [
      {
        companyId: testCompany._id.toString(),
        phoneNumber: '+5511111111111',
        name: 'João Silva',
        customField1: 'Cliente VIP',
        customField2: 'São Paulo'
      },
      {
        companyId: testCompany._id.toString(),
        phoneNumber: '+5511222222222',
        name: 'Maria Santos',
        customField1: 'Cliente Regular',
        customField2: 'Rio de Janeiro'
      },
      {
        companyId: testCompany._id.toString(),
        phoneNumber: '+5511333333333',
        name: 'Pedro Oliveira',
        customField1: 'Prospect',
        customField2: 'Belo Horizonte'
      }
    ]

    for (const contactData of contacts) {
      const contact = new Contact(contactData)
      await contact.save()
    }

    console.log('✅ Database seeded successfully!')
    console.log('\n📋 Dados criados:')
    console.log('🏢 Empresas: 2')
    console.log('👤 Usuários: 2')
    console.log('📱 Instâncias WhatsApp: 2')
    console.log('📞 Contatos: 3')
    console.log('\n🔑 Credenciais de acesso:')
    console.log('Super Admin: admin@disparowpp.com / admin123')
    console.log('Teste: teste@empresa.com / teste123')

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado do MongoDB')
    process.exit(0)
  }
}

seedDatabase()
