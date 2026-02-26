// Service to fetch full text from open access sources

export interface FullTextSource {
  source: 'pmc' | 'arxiv' | 'doi' | 'publisher'
  url: string
  format: 'xml' | 'html' | 'text'
}

export interface FullTextContent {
  title: string
  abstract: string
  fullText: string
  sections?: {
    introduction?: string
    methods?: string
    results?: string
    discussion?: string
    conclusion?: string
  }
  source: FullTextSource
}

class FullTextService {
  
  // Check if paper has free full text available
  static async checkAvailability(pmid: string, pmcId?: string): Promise<FullTextSource[]> {
    console.log(`Checking availability for PMID: ${pmid}, PMC ID: ${pmcId || 'none'}`)
    const sources: FullTextSource[] = []
    
    // Check PMC if we have PMC ID
    if (pmcId) {
      console.log(`Using existing PMC ID: ${pmcId}`)
      sources.push({
        source: 'pmc',
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`,
        format: 'xml'
      })
      return sources // Return early if we already have PMC ID
    }
    
    // Check for PMC ID via eUtils if not available
    console.log(`No PMC ID provided, checking via eUtils API...`)
    try {
      const pmcCheck = await this.checkPMCAvailabilityWithRetry(pmid, 3)
      if (pmcCheck) {
        console.log(`PMC availability check successful:`, pmcCheck)
        sources.push(pmcCheck)
      } else {
        console.log(`No PMC availability found for PMID: ${pmid}`)
      }
    } catch (error) {
      console.log('PMC check failed after retries:', error)
    }
    
    console.log(`Final sources found: ${sources.length}`)
    return sources
  }
  
  // Check PMC availability with retry logic
  private static async checkPMCAvailabilityWithRetry(pmid: string, maxRetries: number): Promise<FullTextSource | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.checkPMCAvailability(pmid)
        return result // Return on first success
      } catch (error) {
        console.log(`PMC check attempt ${attempt}/${maxRetries} failed for PMID ${pmid}:`, error)
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    return null // All retries failed
  }
  
  // Check PMC availability using PubMed eUtils
  private static async checkPMCAvailability(pmid: string): Promise<FullTextSource | null> {
    try {
      const linkUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pmc&id=${pmid}&retmode=json`
      console.log('Checking PMC availability for PMID:', pmid)
      
      const response = await fetch(linkUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Synaptica/1.0 (https://yourapp.com; contact@yourapp.com)'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Check if response has expected structure
      if (!data.linksets || data.linksets.length === 0) {
        console.log('No linksets found for PMID:', pmid)
        return null
      }
      
      const linkset = data.linksets[0]
      if (!linkset.linksetdbs || linkset.linksetdbs.length === 0) {
        console.log('No PMC links found for PMID:', pmid)
        return null
      }
      
      const pmcIds = linkset.linksetdbs[0].links
      if (pmcIds && pmcIds.length > 0) {
        const pmcId = `PMC${pmcIds[0]}`
        console.log('Found PMC ID:', pmcId, 'for PMID:', pmid)
        return {
          source: 'pmc',
          url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`,
          format: 'xml'
        }
      }
      
      console.log('No PMC ID found for PMID:', pmid)
      return null
    } catch (error) {
      console.error('Error checking PMC availability for PMID', pmid, ':', error)
      throw error // Re-throw to allow retry logic to handle it
    }
  }
  
  // Fetch full text from PMC
  static async fetchFromPMC(pmcId: string): Promise<FullTextContent | null> {
    try {
      console.log(`Attempting to fetch full text for PMC ID: ${pmcId}`)
      
      // Fetch XML from PMC OAI service
      const xmlUrl = `https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi?verb=GetRecord&identifier=oai:pubmedcentral.nih.gov:${pmcId.replace('PMC', '')}&metadataPrefix=pmc`
      console.log(`PMC API URL: ${xmlUrl}`)
      
      const response = await fetch(xmlUrl, {
        headers: {
          'User-Agent': 'Synaptica/1.0 (https://yourapp.com; contact@yourapp.com)'
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })
      
      console.log(`PMC API Response status: ${response.status}`)
      
      if (!response.ok) {
        throw new Error(`PMC API returned ${response.status}: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      console.log(`XML response length: ${xmlText.length} characters`)
      
      // Check for PMC OAI error messages
      if (xmlText.includes('<error>') || xmlText.includes('noRecordsMatch')) {
        console.error('PMC OAI service returned an error or no records found')
        console.log('XML Response snippet:', xmlText.substring(0, 500))
        return null
      }
      
      // Parse XML and extract content
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror')
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent)
        return null
      }
      
      return this.parseXMLContent(xmlDoc, pmcId)
      
    } catch (error) {
      console.error('Error fetching from PMC:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
      }
      return null
    }
  }
  
  // Parse XML content from PMC
  private static parseXMLContent(xmlDoc: Document, pmcId: string): FullTextContent | null {
    try {
      console.log(`Parsing XML content for ${pmcId}`)
      
      // Check if we have the expected article structure
      const article = xmlDoc.querySelector('article')
      if (!article) {
        console.error('No article element found in XML')
        console.log('XML structure:', xmlDoc.documentElement?.tagName)
        return null
      }
      
      // Extract title
      const titleEl = xmlDoc.querySelector('article-title')
      const title = titleEl?.textContent?.trim() || ''
      console.log(`Extracted title: ${title.substring(0, 100)}...`)
      
      // Extract abstract
      const abstractEl = xmlDoc.querySelector('abstract p')
      const abstract = abstractEl?.textContent?.trim() || ''
      console.log(`Abstract length: ${abstract.length} characters`)
      
      // Extract body sections
      const bodyEl = xmlDoc.querySelector('body')
      let fullText = ''
      const sections: any = {}
      
      if (bodyEl) {
        // Get all section elements
        const sectionEls = bodyEl.querySelectorAll('sec')
        console.log(`Found ${sectionEls.length} sections`)
        
        sectionEls.forEach((section, index) => {
          const titleEl = section.querySelector('title')
          const sectionTitle = titleEl?.textContent?.toLowerCase() || `section-${index}`
          
          // Get all paragraphs in this section
          const paragraphs = section.querySelectorAll('p')
          const sectionText = Array.from(paragraphs)
            .map(p => p.textContent?.trim())
            .filter(Boolean)
            .join('\n\n')
          
          if (sectionText) {
            fullText += `\n\n${titleEl?.textContent || ''}\n${sectionText}`
            
            // Categorize sections
            if (sectionTitle.includes('introduction')) {
              sections.introduction = sectionText
            } else if (sectionTitle.includes('method')) {
              sections.methods = sectionText
            } else if (sectionTitle.includes('result')) {
              sections.results = sectionText
            } else if (sectionTitle.includes('discussion')) {
              sections.discussion = sectionText
            } else if (sectionTitle.includes('conclusion')) {
              sections.conclusion = sectionText
            }
          }
        })
      } else {
        console.warn('No body element found in article')
      }
      
      const finalFullText = fullText.trim()
      console.log(`Final full text length: ${finalFullText.length} characters`)
      console.log(`Extracted sections: ${Object.keys(sections).join(', ')}`)
      
      // Validate that we extracted meaningful content
      if (!title && !abstract && finalFullText.length < 100) {
        console.error('Insufficient content extracted from XML')
        return null
      }
      
      return {
        title,
        abstract,
        fullText: finalFullText,
        sections,
        source: {
          source: 'pmc',
          url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`,
          format: 'xml'
        }
      }
      
    } catch (error) {
      console.error('Error parsing XML:', error)
      if (error instanceof Error) {
        console.error('Parse error details:', error.message)
      }
      return null
    }
  }
  
  // Main function to get full text for a paper
  static async getFullText(pmid: string, pmcId?: string): Promise<FullTextContent | null> {
    console.log(`Getting full text for PMID: ${pmid}, PMC ID: ${pmcId || 'none provided'}`)
    
    const sources = await this.checkAvailability(pmid, pmcId)
    console.log(`Found ${sources.length} sources:`, sources.map(s => s.source))
    
    // Try PMC first
    const pmcSource = sources.find(s => s.source === 'pmc')
    if (pmcSource) {
      console.log(`Using PMC source: ${pmcSource.url}`)
      const pmcIdFromUrl = pmcSource.url.match(/PMC\d+/)?.[0]
      if (pmcIdFromUrl) {
        console.log(`Extracted PMC ID from URL: ${pmcIdFromUrl}`)
        return await this.fetchFromPMC(pmcIdFromUrl)
      } else {
        console.error('Failed to extract PMC ID from URL:', pmcSource.url)
      }
    } else {
      console.log('No PMC source found in sources')
    }
    
    console.log('No full text content could be retrieved')
    return null
  }
}

export default FullTextService