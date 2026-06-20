import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

const img1 = '/uploads/1781700461076-rxkgjsvszyp.jpg'
const img2 = '/uploads/1781703034924-tnxgyprzi9.avif'

const products = [
  {
    name: 'Syngenta Amistar Top Fungicide',
    description: 'Amistar Top is a broad-spectrum systemic fungicide by Syngenta, combining azoxystrobin and difenoconazole. Highly effective against blast, brown spot, and sheath blight in rice. Provides both curative and preventive action.',
    images: [img1],
    price: 32000,
    stock: 80,
  },
  {
    name: 'BRRI Dhan 28 Rice Seed',
    description: 'BRRI Dhan 28 is one of the most popular high-yielding inbred rice varieties in Bangladesh, developed by the Bangladesh Rice Research Institute. Suitable for the Boro season with a maturation period of 140–145 days.',
    images: [img2],
    price: 8500,
    stock: 200,
  },
  {
    name: 'Urea Fertilizer (1 kg)',
    description: 'High-quality granular urea fertilizer containing 46% nitrogen. Essential for promoting vegetative growth, leaf greening, and overall crop yield. Suitable for all crops including rice, wheat, maize, and vegetables.',
    images: [img1],
    price: 3200,
    stock: 500,
  },
  {
    name: 'TSP (Triple Super Phosphate) 1 kg',
    description: 'Triple Super Phosphate provides 46% phosphorus, stimulating root development and early plant growth. Ideal for rice, maize, and pulse crops. Improves flowering and seed formation in most crops.',
    images: [img2],
    price: 4800,
    stock: 300,
  },
  {
    name: 'Emamectin Benzoate 5% WG',
    description: 'A highly effective insecticide targeting leaf eating caterpillars, fruit borers, and diamond back moths. Works by disrupting nerve signal transmission in pests. Safe for beneficial insects when applied correctly.',
    images: [img1],
    price: 18500,
    stock: 120,
  },
  {
    name: 'Hybrid Tomato Seed — BARI Tomato 14',
    description: 'BARI Tomato 14 is a high-yielding determinate variety developed by the Bangladesh Agricultural Research Institute. Resistant to TYLCV virus and tolerant to heat. Average yield 40–50 tons per hectare.',
    images: [img2],
    price: 12000,
    stock: 150,
  },
  {
    name: 'Imidacloprid 20% SL Insecticide',
    description: 'A systemic neonicotinoid insecticide effective against sucking pests including aphids, thrips, jassids, and whiteflies. Absorbed through roots and leaves, providing long-lasting protection for vegetables and rice.',
    images: [img1],
    price: 14500,
    stock: 90,
  },
  {
    name: 'Potassium Sulphate (SOP) 1 kg',
    description: 'Sulphate of Potash (SOP) provides potassium and sulphur without adding chloride, making it ideal for chloride-sensitive crops like potatoes, tobacco, and fruits. Improves fruit quality and disease resistance.',
    images: [img2],
    price: 5500,
    stock: 250,
  },
  {
    name: 'Chlorpyrifos 48% EC',
    description: 'A broad-spectrum organophosphate insecticide effective against soil pests, stem borers, and sucking insects in rice, maize, and vegetable crops. Controls larvae, nymphs, and adults on contact and ingestion.',
    images: [img1],
    price: 9800,
    stock: 110,
  },
  {
    name: 'Hybrid Bitter Gourd Seed — Green Boy',
    description: 'Green Boy is a popular F1 bitter gourd hybrid with deep green, smooth-surfaced fruits averaging 20–25 cm in length. Early bearing, high yielding, and tolerant to major diseases. Ideal for both Kharif and Rabi seasons.',
    images: [img2],
    price: 22000,
    stock: 75,
  },
  {
    name: 'Mancozeb 80% WP Fungicide',
    description: 'A contact multi-site fungicide for controlling a wide range of fungal diseases including late blight, early blight, and downy mildew in potatoes, tomatoes, and other vegetable crops. Excellent preventive action.',
    images: [img1],
    price: 7500,
    stock: 180,
  },
  {
    name: 'Boron Fertilizer (Solubor) 500g',
    description: 'Solubor is a highly water-soluble boron fertilizer for correcting boron deficiency in crops. Essential for cell wall formation, pollination, and fruit set. Particularly important for mustard, sunflower, and legume crops.',
    images: [img2],
    price: 6000,
    stock: 160,
  },
  {
    name: 'Hybrid Eggplant Seed — BARI Begun 8',
    description: 'BARI Begun 8 is an early-maturing, high-yielding brinjal variety with round, shiny purple fruits. Resistant to shoot and fruit borer when combined with proper management. Average yield 25 tons per hectare.',
    images: [img1],
    price: 9500,
    stock: 130,
  },
  {
    name: 'Carbofuran 5G (Furadan)',
    description: 'Carbofuran 5G is a systemic soil insecticide and nematicide applied at transplanting for controlling root-knot nematodes, stem borers, and other soil-dwelling pests in rice, cabbage, and other crops.',
    images: [img2],
    price: 11000,
    stock: 95,
  },
  {
    name: 'MOP (Muriate of Potash) 1 kg',
    description: 'Muriate of Potash (MOP) is the most widely used potassic fertilizer, containing 60% K₂O. It enhances disease resistance, improves root growth, water regulation, and overall crop quality. Suitable for most field crops.',
    images: [img1],
    price: 3800,
    stock: 400,
  },
  {
    name: 'Propiconazole 25% EC Fungicide',
    description: 'A systemic triazole fungicide with both curative and preventive action against blast, sheath blight, and brown spot in rice. Also effective against powdery mildew and rust in wheat. Fast-acting with long residual effect.',
    images: [img2],
    price: 16500,
    stock: 100,
  },
  {
    name: 'Hybrid Cucumber Seed — Malini F1',
    description: 'Malini F1 is a parthenocarpic cucumber hybrid with glossy dark green fruits of uniform shape and size. High yields even under low light conditions. Disease resistant with excellent shelf life for market sale.',
    images: [img1],
    price: 28500,
    stock: 60,
  },
  {
    name: 'Zinc Sulphate Fertilizer 500g',
    description: 'Zinc Sulphate corrects zinc deficiency in soils, a common issue in Bangladesh that causes "khaira disease" in rice. Improves grain filling, root development, and overall crop health. Recommended for rice, wheat, and maize.',
    images: [img2],
    price: 4200,
    stock: 220,
  },
]

async function main() {
  console.log(`Seeding ${products.length} products…`)
  for (const p of products) {
    await (prisma as any).product.create({
      data: { ...p, visible: true, source: 'manual' },
    })
    process.stdout.write('.')
  }
  console.log('\nDone.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
