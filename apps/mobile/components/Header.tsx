import React from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const Header = ({ 
  title, 
  showBack = true, 
  rightAction, 
  transparent = false 
}: HeaderProps) => {
  const router = useRouter();

  return (
    <Box 
      className={`${transparent ? 'bg-transparent' : 'bg-white dark:bg-zinc-950'} z-50 pt-2 pb-3 px-5 border-b ${transparent ? 'border-transparent' : 'border-zinc-100 dark:border-zinc-900'}`}
      style={{
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
      }}
    >
      <HStack className="justify-between items-center h-14">
        {/* Left Section */}
        <Box className="w-10">
          {showBack && (
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 items-center justify-center active:scale-95"
            >
              <Icon as={ChevronLeft} className="text-zinc-900 dark:text-white" size="md" />
            </Pressable>
          )}
        </Box>

        {/* Center Section: Title */}
        <Box className="flex-1 items-center px-2">
          <Text 
            className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter" 
            numberOfLines={1}
          >
            {title}
          </Text>
        </Box>

        {/* Right Section */}
        <Box className="w-10 items-end">
          {rightAction || <Box className="w-10" />}
        </Box>
      </HStack>
    </Box>
  );
};

export default Header;
