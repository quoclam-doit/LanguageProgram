import { Card } from '../models/Card';
import { ImportJob } from '../models/ImportJob';
import { lookupPhonetic } from './dictionary.service';

/**
 * Enriches every card created by an import job with IPA/audio in the background.
 * Never throws outward - a per-card lookup or save failure is recorded on the
 * job and that card is simply skipped; the job still reaches 'completed' once
 * every card has been attempted.
 */
export async function processImportJob(jobId: string): Promise<void> {
  try {
    const job = await ImportJob.findById(jobId);
    if (!job) return;

    job.status = 'processing';
    await job.save();

    for (const cardId of job.cardIds) {
      try {
        const card = await Card.findById(cardId);
        if (card) {
          const result = await lookupPhonetic(card.term);
          if (result.ipa.us || result.ipa.uk) {
            card.ipa = result.ipa;
          }
          if (result.audioUrl.us || result.audioUrl.uk) {
            card.audioUrl = result.audioUrl.us || result.audioUrl.uk;
          }
          await card.save();
        }
      } catch (err: any) {
        console.error(`[Import Worker] Enrich failed for card ${cardId.toString()}:`, err);
      }

      job.processedRows += 1;
      await job.save();
    }

    job.status = 'completed';
    await job.save();
  } catch (err) {
    // A DB hiccup on the job document itself (not a per-card lookup failure,
    // already handled above) - mark the job failed instead of leaving it
    // stuck at 'pending'/'processing' forever with no way for a client to know.
    console.error('[Import Worker] Job failed:', err);
    await ImportJob.findByIdAndUpdate(jobId, { status: 'failed' }).catch(() => {});
  }
}
