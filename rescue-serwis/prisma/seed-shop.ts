import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    name: 'Lampy ostrzegawcze',
    slug: 'lampy-ostrzegawcze',
    description: 'Lampy sygnalizacyjne LED i halogenowe do pojazdów uprzywilejowanych',
    products: [
      {
        name: 'Lampa LED Whelen L10',
        slug: 'lampa-led-whelen-l10',
        sku: 'WHL-L10-BL',
        brand: 'Whelen',
        description: 'Lampa ostrzegawcza LED o wysokiej jasności, kolor niebieski, 12-24V',
        price: '389.00',
        inStock: true,
      },
      {
        name: 'Lampa belkowa Federal Signal Valor',
        slug: 'lampa-belkowa-federal-signal-valor',
        sku: 'FS-VALOR-BB',
        brand: 'Federal Signal',
        description: 'Belka sygnalizacyjna LED pełna, niebiesko-niebieska, do samochodów uprzywilejowanych',
        price: '1290.00',
        inStock: true,
      },
      {
        name: 'Lampa ostrzegawcza Hella KL700',
        slug: 'lampa-ostrzegawcza-hella-kl700',
        sku: 'HELLA-KL700-AM',
        brand: 'Hella',
        description: 'Okrągła lampa błyskowa LED, kolor bursztynowy, montaż magnetyczny',
        price: '215.00',
        inStock: true,
      },
    ],
  },
  {
    name: 'Głośniki i nagłośnienie',
    slug: 'glosniki-i-naglosnienie',
    description: 'Głośniki, wzmacniacze i zestawy nagłośnienia do pojazdów służb ratowniczych',
    products: [
      {
        name: 'Głośnik Federal Signal AS124',
        slug: 'glosnik-federal-signal-as124',
        sku: 'FS-AS124',
        brand: 'Federal Signal',
        description: 'Głośnik tubowy 100W, 8Ω, odporny na warunki atmosferyczne, montaż pod maską',
        price: '345.00',
        inStock: true,
      },
      {
        name: 'Zestaw nagłośnienia Whelen SA315P',
        slug: 'zestaw-naglosnienia-whelen-sa315p',
        sku: 'WHL-SA315P',
        brand: 'Whelen',
        description: 'Wzmacniacz syrenowy 100W z mikrofonem PA i głośnikiem 100W w zestawie',
        price: '890.00',
        inStock: false,
      },
      {
        name: 'Głośnik Hella Rallye 3000',
        slug: 'glosnik-hella-rallye-3000',
        sku: 'HELLA-R3000',
        brand: 'Hella',
        description: 'Głośnik kierunkowy 150W do montażu na dachu, IP67',
        price: '420.00',
        inStock: true,
      },
    ],
  },
  {
    name: 'Generatory',
    slug: 'generatory',
    description: 'Agregaty prądotwórcze i generatory awaryjne dla jednostek ratowniczych',
    products: [
      {
        name: 'Generator Honda EU22i',
        slug: 'generator-honda-eu22i',
        sku: 'HONDA-EU22I',
        brand: 'Honda',
        description: 'Generator inwertorowy 2200W, cichy, lekki, idealny do akcji ratowniczych',
        price: '3490.00',
        inStock: true,
      },
      {
        name: 'Agregat Yamaha EF2200iS',
        slug: 'agregat-yamaha-ef2200is',
        sku: 'YAM-EF2200IS',
        brand: 'Yamaha',
        description: 'Agregat prądotwórczy 2200W z technologią Smart Throttle, cichy i oszczędny',
        price: '3190.00',
        inStock: true,
      },
      {
        name: 'Generator Pramac P6000',
        slug: 'generator-pramac-p6000',
        sku: 'PRAM-P6000',
        brand: 'Pramac',
        description: 'Generator stacjonarny 5500W, silnik benzyna/LPG, panel ATS',
        price: '4750.00',
        inStock: false,
      },
    ],
  },
  {
    name: 'Syreny i sygnalizatory',
    slug: 'syreny-i-sygnalizatory',
    description: 'Syreny elektroniczne, moduly dźwiękowe i sygnalizatory alarmowe',
    products: [
      {
        name: 'Syrena elektroniczna Federal Signal SS2000',
        slug: 'syrena-elektroniczna-federal-signal-ss2000',
        sku: 'FS-SS2000',
        brand: 'Federal Signal',
        description: 'Syrena 200W z 4 tonami alarmowymi i funkcją PA, dedykowana dla PSP',
        price: '1150.00',
        inStock: true,
      },
      {
        name: 'Moduł syrenowy Whelen WS295',
        slug: 'modul-syrenowy-whelen-ws295',
        sku: 'WHL-WS295',
        brand: 'Whelen',
        description: 'Sterownik syreny 100W, 6 tonów, wejście mikrofonu PA, złącza Deutsch',
        price: '760.00',
        inStock: true,
      },
      {
        name: 'Sygnalizator świetlno-dźwiękowy Patlite LR6',
        slug: 'sygnalizator-swietlno-dzwiekowy-patlite-lr6',
        sku: 'PAT-LR6-RYG',
        brand: 'Patlite',
        description: 'Kolumna sygnalizacyjna LED 3-kolorowa (R/Y/G) z buzzererem, IP65',
        price: '285.00',
        inStock: true,
      },
    ],
  },
]

async function main() {
  console.log('Seeding shop categories and products...')

  for (const cat of categories) {
    const { products, ...categoryData } = cat

    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { name: categoryData.name, description: categoryData.description },
      create: categoryData,
    })

    console.log(`  Category: ${category.name}`)

    for (const prod of products) {
      const product = await prisma.product.upsert({
        where: { slug: prod.slug },
        update: { ...prod, categoryId: category.id },
        create: { ...prod, categoryId: category.id },
      })
      console.log(`    Product: ${product.name}`)
    }
  }

  const catCount = await prisma.category.count()
  const prodCount = await prisma.product.count()
  console.log(`\nDone: ${catCount} categories, ${prodCount} products in database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
