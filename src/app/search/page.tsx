"use client"

import { useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PubMedLink {
  type: 'PMC' | 'DOI' | 'Free Full-Text' | 'Publisher'
  url: string
  label: string
}

interface PubMedArticle {
  id: string
  title: string
  authors: string[]
  journal: string
  pubDate: string
  abstract: string
  pmid: string
  doi?: string
  pmcId?: string
  links: PubMedLink[]
}

const fetchPubMedArticles = async (searchTerm: string): Promise<PubMedArticle[]> => {
  if (!searchTerm.trim()) return []
  
  try {
    // First, search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=10&sort=pub_date`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    const ids = searchData.esearchresult?.idlist || []
    
    if (ids.length === 0) return []
    
    // Fetch detailed info for those IDs
    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`
    const detailsResponse = await fetch(detailsUrl)
    const xmlText = await detailsResponse.text()
    
    // Fetch link information for those IDs
    const linksUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&db=pmc&id=${ids.join(',')}&retmode=xml`
    const linksResponse = await fetch(linksUrl)
    const linksXmlText = await linksResponse.text()
    
    // Parse XML to extract article information
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const linksDoc = parser.parseFromString(linksXmlText, 'text/xml')
    const articles = xmlDoc.querySelectorAll('PubmedArticle')
    
    // Create PMC ID mapping from links
    const pmcMap = new Map<string, string>()
    const linkSets = linksDoc.querySelectorAll('LinkSet')
    linkSets.forEach(linkSet => {
      const fromId = linkSet.querySelector('IdList Id')?.textContent
      const toIds = linkSet.querySelectorAll('LinkSetDb[DbTo="pmc"] Link Id')
      if (fromId && toIds.length > 0) {
        const pmcId = toIds[0]?.textContent
        if (pmcId) pmcMap.set(fromId, pmcId)
      }
    })
    
    return Array.from(articles).map((article, index) => {
      const titleElement = article.querySelector('ArticleTitle')
      const title = titleElement?.textContent || 'No title available'
      
      const authorElements = article.querySelectorAll('Author LastName')
      const authors = Array.from(authorElements).map(author => author.textContent || '').filter(Boolean)
      
      const journalElement = article.querySelector('Title')
      const journal = journalElement?.textContent || 'Unknown journal'
      
      const pubDateElement = article.querySelector('PubDate Year')
      const pubDate = pubDateElement?.textContent || 'Unknown date'
      
      const abstractElement = article.querySelector('AbstractText')
      const abstract = abstractElement?.textContent || 'No abstract available'
      
      const pmidElement = article.querySelector('PMID')
      const pmid = pmidElement?.textContent || ids[index]
      
      // Extract DOI
      const doiElements = article.querySelectorAll('ELocationID[EIdType="doi"]')
      const doi = doiElements[0]?.textContent || undefined
      
      // Get PMC ID from mapping
      const pmcId = pmcMap.get(pmid)
      
      // Build links array
      const links: PubMedLink[] = []
      
      // Add PMC link if available
      if (pmcId) {
        links.push({
          type: 'PMC',
          url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcId}/`,
          label: 'Free Full-Text (PMC)'
        })
      }
      
      // Add DOI link if available
      if (doi) {
        links.push({
          type: 'DOI',
          url: `https://doi.org/${doi}`,
          label: 'Publisher (DOI)'
        })
      }
      
      return {
        id: pmid,
        title,
        authors: authors.slice(0, 3), // Limit to first 3 authors
        journal,
        pubDate,
        abstract: abstract.substring(0, 200) + (abstract.length > 200 ? '...' : ''),
        pmid,
        doi,
        pmcId,
        links,
      }
    })
  } catch (error) {
    console.error("Error fetching PubMed data:", error)
    throw new Error("Failed to fetch PubMed articles")
  }
}

const columnHelper = createColumnHelper<PubMedArticle>()

const columns = [
  columnHelper.accessor("title", {
    id: "title",
    header: "Title",
    cell: (info) => (
      <div className="max-w-md">
        <div className="font-medium text-primary hover:text-primary/80 transition-colors">
          {info.getValue()}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("authors", {
    id: "authors",
    header: "Authors",
    cell: (info) => {
      const authors = info.getValue()
      return (
        <div className="text-sm text-muted-foreground">
          {authors.length > 0 ? authors.join(", ") : "No authors listed"}
          {authors.length === 3 ? " et al." : ""}
        </div>
      )
    },
  }),
  columnHelper.accessor("journal", {
    id: "journal",
    header: "Journal",
    cell: (info) => (
      <div className="text-sm">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("pubDate", {
    id: "pubDate",
    header: "Year",
    cell: (info) => (
      <div className="text-sm text-center">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("pmid", {
    id: "pmid",
    header: "PMID",
    cell: (info) => (
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/${info.getValue()}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent/80 underline transition-colors"
      >
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("links", {
    id: "links",
    header: "Access",
    cell: (info) => {
      const links = info.getValue()
      if (links.length === 0) {
        return <div className="text-xs text-muted-foreground">Abstract Only</div>
      }
      
      return (
        <div className="flex flex-col gap-1">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md hover:bg-green-200 transition-colors inline-flex items-center gap-1"
            >
              {link.type === 'PMC' ? '🔓' : '📄'} {link.type}
            </a>
          ))}
        </div>
      )
    },
  }),
]

export default function SearchPubMedPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [queryTerm, setQueryTerm] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["pubmed", queryTerm],
    queryFn: () => fetchPubMedArticles(queryTerm),
    enabled: !!queryTerm,
  })

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setQueryTerm(searchTerm.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center gradient-brand-text">
        Search PubMed
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Find and explore the latest scientific publications
      </p>
      
      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Search PubMed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter search terms (e.g., 'machine learning', 'COVID-19', 'cancer research')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          {queryTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing results for: <span className="font-medium text-primary">"{queryTerm}"</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && queryTerm && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching PubMed database...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-destructive text-xl mb-2">⚠️ Error</div>
            <p className="text-muted-foreground">Failed to search PubMed. Please try again.</p>
          </div>
        </div>
      )}

      {/* No Search State */}
      {!queryTerm && !isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">🔍</div>
            <p className="text-muted-foreground">Enter a search term above to find scientific publications</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {data && data.length > 0 && !isLoading && (
        <>
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <span className="text-primary"> ↑</span>,
                              desc: <span className="text-accent"> ↓</span>,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-primary">{data.length}</span> latest publications
              {data.length === 10 && " (limited to 10 results)"}
            </p>
          </div>
        </>
      )}

      {/* No Results */}
      {data && data.length === 0 && queryTerm && !isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">📄</div>
            <p className="text-muted-foreground">No publications found for "{queryTerm}". Try different search terms.</p>
          </div>
        </div>
      )}
    </div>
  )
}