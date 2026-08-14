import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const incidents = [
  {
    title: "Cannot access VPN from home",
    description: "I am trying to connect to the corporate VPN using Cisco AnyConnect but it says authentication failed. I have reset my password but it still doesn't work.",
    status: "open",
    priority: "high",
    category: "network",
  },
  {
    title: "Outlook is not syncing",
    description: "My Outlook desktop client stopped receiving new emails since yesterday. The webmail works fine though.",
    status: "open",
    priority: "medium",
    category: "software",
  },
  {
    title: "Need a new monitor",
    description: "My current monitor has a crack on the screen. I need a replacement as soon as possible.",
    status: "open",
    priority: "low",
    category: "hardware",
  },
  {
    title: "How to install Node.js?",
    description: "I need to start working on a new project and require Node.js v18 installed on my machine. I don't have admin rights.",
    status: "open",
    priority: "low",
    category: "software",
  },
  {
    title: "Blue screen of death",
    description: "My laptop keeps crashing with a blue screen every time I open Adobe Premiere. Error code is MEMORY_MANAGEMENT.",
    status: "open",
    priority: "high",
    category: "hardware",
  }
];

const kbArticles = [
  {
    title: "VPN Troubleshooting Guide",
    content: "If you cannot connect to the VPN: 1. Ensure your internet connection is stable. 2. Verify you are using your latest AD password. 3. Try clearing the AnyConnect cache. 4. If authentication fails repeatedly, your account might be locked. Contact IT support to unlock.",
    tags: "vpn, network, connection"
  },
  {
    title: "Outlook Sync Issues",
    content: "To fix Outlook not syncing: 1. Check bottom right of Outlook for 'Disconnected' status. 2. Try 'Work Offline' toggle. 3. Restart Outlook. 4. Rebuild your OST file by going to Account Settings -> Data Files.",
    tags: "outlook, email, sync"
  },
  {
    title: "Hardware Replacement Policy",
    content: "For damaged hardware (monitors, laptops, mice), please submit a ticket with a photo of the damage. Replacements are usually processed within 2-3 business days. You will need manager approval for items over $500.",
    tags: "hardware, replacement, monitor"
  },
  {
    title: "Installing Software via Self-Service Portal",
    content: "Users without admin rights can install approved software (like Node.js, VS Code, etc.) via the Corporate Self-Service Portal app on your desktop. Just open the app, search for the software, and click Install.",
    tags: "software, admin, install"
  },
  {
    title: "Troubleshooting Blue Screen (BSOD)",
    content: "A BSOD often indicates a driver or hardware fault. For MEMORY_MANAGEMENT, please run the Windows Memory Diagnostic tool. If the issue persists with specific apps like Adobe, try updating your graphics drivers via the Self-Service Portal.",
    tags: "bsod, crash, windows"
  }
];

async function main() {
  console.log("Seeding database...");

  // Clear existing
  await prisma.incident.deleteMany();
  await prisma.kBArticle.deleteMany();

  // Create KBs
  for (const kb of kbArticles) {
    await prisma.kBArticle.create({ data: kb });
  }

  // Create incidents
  for (const incident of incidents) {
    await prisma.incident.create({ data: incident });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
