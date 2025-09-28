import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
	try {
		const formData = await request.formData()
		const file = formData.get('image') as File | null
		const title = (formData.get('title') as string | null) ?? ''
		const description = (formData.get('description') as string | null) ?? null
		const yearStr = (formData.get('year') as string | null) ?? null
		const tagsStr = (formData.get('tags') as string | null) ?? ''

		if (!file || !title) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
		}

		const buffer = Buffer.from(await file.arrayBuffer())
		const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
		await mkdir(uploadsDir, { recursive: true })

		const ext = path.extname(file.name) || '.jpg'
		const name = crypto.randomBytes(16).toString('hex') + ext
		const filePath = path.join(uploadsDir, name)

		await writeFile(filePath, buffer)

		const relPath = `/uploads/${name}`
		const year = yearStr ? parseInt(yearStr, 10) : null
		const tagNames = tagsStr
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0)

		const tagRecords = await Promise.all(
			tagNames.map(async (tagName) => {
				return prisma.tag.upsert({
					where: { name: tagName },
					update: {},
					create: { name: tagName },
				})
			})
		)

		const exhibit = await prisma.exhibit.create({
			data: {
				title,
				description,
				year: year ?? undefined,
				imagePath: relPath,
				tags: {
					create: tagRecords.map((tag) => ({ tagId: tag.id })),
				},
			},
			include: { tags: { include: { tag: true } } },
		})

		return NextResponse.json({ exhibit }, { status: 201 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}