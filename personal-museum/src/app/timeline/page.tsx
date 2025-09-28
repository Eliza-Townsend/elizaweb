import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getTimeline() {
	const exhibits = await prisma.exhibit.findMany({
		orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
	})
	const groups = new Map<number, typeof exhibits>()
	exhibits.forEach((ex) => {
		const key = ex.year ?? 0
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key)!.push(ex)
	})
	const orderedYears = Array.from(groups.keys()).sort((a, b) => b - a)
	return { groups, years: orderedYears }
}

export default async function TimelinePage() {
	const { groups, years } = await getTimeline()
	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Timeline</h1>
				<Link href="/" className="underline text-sm">Gallery</Link>
			</div>
			<div className="space-y-8">
				{years.map((y) => (
					<div key={y} className="space-y-3">
						<h2 className="text-xl font-medium">{y === 0 ? 'Unknown Year' : y}</h2>
						<ul className="space-y-2">
							{groups.get(y)!.map((ex) => (
								<li key={ex.id} className="flex items-center justify-between border-b py-2">
									<Link href={`/exhibits/${ex.id}`} className="underline">{ex.title}</Link>
									<span className="text-xs text-gray-500">#{ex.id}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	)
}