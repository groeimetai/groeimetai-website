#!/usr/bin/env tsx

import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase/config';
import chalk from 'chalk';
import { format } from 'date-fns';

async function checkEmailQueue() {
  console.log(chalk.cyan.bold('\n📧 Email Queue Status Check\n'));
  console.log(chalk.gray('═══════════════════════════════════════\n'));

  try {
    // Check mail collection (outgoing emails)
    console.log(chalk.yellow('📤 Checking outgoing mail queue...'));
    const mailQuery = query(
      collection(db, 'mail'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const mailSnapshot = await getDocs(mailQuery);
    console.log(chalk.blue(`Found ${mailSnapshot.size} emails in mail collection\n`));

    if (mailSnapshot.empty) {
      console.log(chalk.orange('⚠️  No emails found in mail collection'));
    } else {
      mailSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(chalk.white(`${index + 1}. Email ID: ${doc.id}`));
        console.log(chalk.gray(`   To: ${data.to}`));
        console.log(chalk.gray(`   Subject: ${data.message?.subject || 'No subject'}`));
        console.log(chalk.gray(`   Created: ${data.timestamp ? format(data.timestamp.toDate(), 'dd-MM-yyyy HH:mm:ss') : 'No timestamp'}`));
        
        if (data.delivery) {
          console.log(chalk.green(`   Status: ${data.delivery.state || 'Unknown'}`));
          if (data.delivery.error) {
            console.log(chalk.red(`   Error: ${data.delivery.error}`));
          }
        } else {
          console.log(chalk.yellow(`   Status: Pending/Processing`));
        }
        console.log('');
      });
    }

    // Check contact submissions
    console.log(chalk.yellow('📝 Checking contact submissions...'));
    const contactsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const contactsSnapshot = await getDocs(contactsQuery);
    console.log(chalk.blue(`Found ${contactsSnapshot.size} contact submissions\n`));

    if (contactsSnapshot.empty) {
      console.log(chalk.orange('⚠️  No contact submissions found'));
    } else {
      contactsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(chalk.white(`${index + 1}. Contact ID: ${doc.id}`));
        console.log(chalk.gray(`   Name: ${data.name}`));
        console.log(chalk.gray(`   Company: ${data.company}`));
        console.log(chalk.gray(`   Email: ${data.email}`));
        console.log(chalk.gray(`   Type: ${data.conversationType}`));
        console.log(chalk.gray(`   Status: ${data.status}`));
        console.log(chalk.gray(`   Submitted: ${data.submittedAt ? format(data.submittedAt.toDate(), 'dd-MM-yyyy HH:mm:ss') : 'No timestamp'}`));
        console.log('');
      });
    }

    // Check scheduled emails
    console.log(chalk.yellow('⏰ Checking scheduled emails...'));
    const scheduledQuery = query(
      collection(db, 'scheduled_emails'),
      orderBy('scheduledFor', 'desc'),
      limit(5)
    );

    const scheduledSnapshot = await getDocs(scheduledQuery);
    console.log(chalk.blue(`Found ${scheduledSnapshot.size} scheduled emails\n`));

    if (!scheduledSnapshot.empty) {
      scheduledSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(chalk.white(`${index + 1}. Scheduled Email ID: ${doc.id}`));
        console.log(chalk.gray(`   Email: ${data.email}`));
        console.log(chalk.gray(`   Type: ${data.type}`));
        console.log(chalk.gray(`   Status: ${data.status}`));
        console.log(chalk.gray(`   Scheduled for: ${data.scheduledFor ? format(data.scheduledFor.toDate(), 'dd-MM-yyyy HH:mm:ss') : 'No date'}`));
        console.log('');
      });
    }

  } catch (error) {
    console.error(chalk.red('❌ Error checking email queue:'), error);
  }
}

async function main() {
  await checkEmailQueue();
}

main();