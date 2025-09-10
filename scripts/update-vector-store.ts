#!/usr/bin/env tsx

import { WebScraperService } from '../src/lib/agents/web-scraper-service';
import { config } from 'dotenv';
import ora from 'ora';
import chalk from 'chalk';

// Load environment variables
config();

interface UpdateOptions {
  fullReindex?: boolean;
  testMode?: boolean;
  urls?: string[];
}

class VectorStoreUpdater {
  private scraper: WebScraperService;
  private spinner: ora.Ora;

  constructor() {
    this.scraper = new WebScraperService();
    this.spinner = ora();
  }

  async updateVectorStore(options: UpdateOptions = {}) {
    console.log(chalk.cyan.bold('\n🚀 GroeimetAI Vector Store Updater\n'));
    console.log(chalk.gray('═══════════════════════════════════════\n'));

    const urls = options.urls || [
      'https://groeimetai.com',
      'https://groeimetai.com/diensten',
      'https://groeimetai.com/over-ons',
      'https://groeimetai.com/cases',
      'https://groeimetai.com/contact',
      'https://groeimetai.com/blog',
      'https://groeimetai.com/kennis',
      'https://groeimetai.com/servicenow-ai',
      'https://groeimetai.com/generative-ai',
      'https://groeimetai.com/multi-agent-systems',
      'https://groeimetai.com/ai-consulting',
      'https://groeimetai.com/ai-implementatie',
      'https://groeimetai.com/ai-training',
      'https://groeimetai.com/custom-ai-solutions',
      'https://groeimetai.com/ai-integratie',
      'https://groeimetai.com/machine-learning',
      'https://groeimetai.com/natural-language-processing',
      'https://groeimetai.com/computer-vision',
      'https://groeimetai.com/predictive-analytics',
      'https://groeimetai.com/process-automation',
      'https://groeimetai.com/chatbots-virtual-assistants',
      'https://groeimetai.com/data-science',
    ];

    // Test mode - only process first 3 URLs
    const urlsToProcess = options.testMode ? urls.slice(0, 3) : urls;

    console.log(chalk.yellow(`📋 URLs to process: ${urlsToProcess.length}`));
    console.log(chalk.yellow(`🔄 Full reindex: ${options.fullReindex ? 'Yes' : 'No'}`));
    console.log(chalk.yellow(`🧪 Test mode: ${options.testMode ? 'Yes' : 'No'}\n`));

    // Clear existing vectors if full reindex
    if (options.fullReindex) {
      this.spinner.start('Clearing existing vectors...');
      try {
        await this.scraper.clearVectorStore();
        this.spinner.succeed(chalk.green('✅ Existing vectors cleared'));
      } catch (error) {
        this.spinner.fail(chalk.red('❌ Failed to clear vectors'));
        console.error(error);
        return;
      }
    }

    // Process each URL
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      const progress = `[${i + 1}/${urlsToProcess.length}]`;
      
      this.spinner.start(`${progress} Processing ${chalk.cyan(url)}...`);
      
      try {
        const result = await this.scraper.scrapeAndIndex(url);
        
        if (result.success) {
          this.spinner.succeed(
            chalk.green(`${progress} ✅ ${url}`) + 
            chalk.gray(` (${result.chunks} chunks, ${result.tokens} tokens)`)
          );
          successCount++;
        } else {
          this.spinner.fail(
            chalk.red(`${progress} ❌ ${url}`) + 
            chalk.gray(` - ${result.error}`)
          );
          failCount++;
        }
      } catch (error) {
        this.spinner.fail(
          chalk.red(`${progress} ❌ ${url}`) + 
          chalk.gray(` - ${error instanceof Error ? error.message : 'Unknown error'}`)
        );
        failCount++;
      }

      // Add delay between requests to avoid rate limiting
      if (i < urlsToProcess.length - 1) {
        await this.delay(1000);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print summary
    console.log(chalk.gray('\n═══════════════════════════════════════\n'));
    console.log(chalk.cyan.bold('📊 Update Summary:\n'));
    console.log(chalk.green(`✅ Success: ${successCount} pages`));
    console.log(chalk.red(`❌ Failed: ${failCount} pages`));
    console.log(chalk.blue(`⏱️  Duration: ${duration} seconds`));
    console.log(chalk.yellow(`📦 Vector store: Pinecone (groeimetai-website)`));
    
    // Get vector store stats
    try {
      const stats = await this.scraper.getVectorStoreStats();
      console.log(chalk.magenta(`📈 Total vectors: ${stats.totalVectors}`));
      console.log(chalk.magenta(`💾 Index fullness: ${(stats.indexFullness * 100).toFixed(2)}%`));
    } catch (error) {
      console.log(chalk.gray('⚠️  Could not retrieve vector store stats'));
    }

    console.log(chalk.gray('\n═══════════════════════════════════════\n'));
    
    if (successCount > 0) {
      console.log(chalk.green.bold('✨ Vector store successfully updated!\n'));
    } else {
      console.log(chalk.red.bold('⚠️  No pages were successfully indexed.\n'));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const updater = new VectorStoreUpdater();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: UpdateOptions = {
    fullReindex: args.includes('--full'),
    testMode: args.includes('--test'),
  };

  // Custom URLs if provided
  const urlIndex = args.indexOf('--urls');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    options.urls = args[urlIndex + 1].split(',');
  }

  try {
    await updater.updateVectorStore(options);
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { VectorStoreUpdater };