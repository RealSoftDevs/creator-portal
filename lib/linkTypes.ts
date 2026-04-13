export interface LinkType {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  color: string;
  bgColor: string;
}

export const socialLinks: LinkType[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    placeholder: 'https://instagram.com/username',
    color: '#E4405F',
    bgColor: 'bg-pink-500'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    placeholder: 'https://youtube.com/@username',
    color: '#FF0000',
    bgColor: 'bg-red-600'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Music',
    placeholder: 'https://tiktok.com/@username',
    color: '#000000',
    bgColor: 'bg-black'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    placeholder: 'https://facebook.com/username',
    color: '#1877F2',
    bgColor: 'bg-blue-600'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'Twitter',
    placeholder: 'https://twitter.com/username',
    color: '#1DA1F2',
    bgColor: 'bg-blue-400'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    placeholder: 'https://linkedin.com/in/username',
    color: '#0A66C2',
    bgColor: 'bg-blue-700'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'Github',
    placeholder: 'https://github.com/username',
    color: '#333333',
    bgColor: 'bg-gray-800'
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'Twitch',
    placeholder: 'https://twitch.tv/username',
    color: '#9146FF',
    bgColor: 'bg-purple-600'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'Disc',
    placeholder: 'https://discord.gg/invite',
    color: '#5865F2',
    bgColor: 'bg-indigo-500'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'MessageCircle',
    placeholder: 'https://wa.me/1234567890',
    color: '#25D366',
    bgColor: 'bg-green-500'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'Send',
    placeholder: 'https://t.me/username',
    color: '#26A5E4',
    bgColor: 'bg-blue-500'
  },
  {
    id: 'amazon',
    name: 'Amazon Shop',
    icon: 'ShoppingBag',
    placeholder: 'https://amazon.com/shop/username',
    color: '#FF9900',
    bgColor: 'bg-orange-500'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'Music',
    placeholder: 'https://open.spotify.com/artist/...',
    color: '#1DB954',
    bgColor: 'bg-green-600'
  },
  {
    id: 'apple',
    name: 'Apple Music',
    icon: 'Apple',
    placeholder: 'https://music.apple.com/...',
    color: '#000000',
    bgColor: 'bg-black'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'Camera',
    placeholder: 'https://snapchat.com/add/username',
    color: '#FFFC00',
    bgColor: 'bg-yellow-400'
  },
  {
    id: 'custom',
    name: 'Custom Link',
    icon: 'Link2',
    placeholder: 'https://yourwebsite.com',
    color: '#6B7280',
    bgColor: 'bg-gray-500'
  }
];