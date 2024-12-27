'use client';

import { useLastAuction } from '@/hooks/auction';
import {
  useWatchAuctionAuctionBidEvent,
  useWatchAuctionAuctionSettledEvent,
} from '@/hooks/wagmiGenerated';
import { Auction } from '@/services/auction';
import { weiToSparks } from '@/utils/spark';
import {
  Badge,
  Box,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { revalidatePath } from 'next/cache';
import { default as NextImage } from 'next/image';
import Countdown from 'react-countdown';
import { BsEmojiAstonished } from 'react-icons/bs';
import { FaBirthdayCake, FaEthereum, FaUser } from 'react-icons/fa';
import { LuClock, LuSparkles } from 'react-icons/lu';
import { AuctionBid } from '../auction/bid';
import { FormattedAddress } from '../utils/ethereum';

export default function AuctionCard({
  defaultAuction,
}: {
  defaultAuction: Auction;
}) {
  const { data: activeAuction, refetch } = useLastAuction(defaultAuction);

  useWatchAuctionAuctionBidEvent({
    onLogs(logs) {
      // @todo: remove logs
      console.log('AuctionBidEvent', logs);
      refetch();
      revalidatePath('/');
    },
  });

  useWatchAuctionAuctionSettledEvent({
    onLogs(logs) {
      // @todo: remove logs
      console.log('AuctionSettledEvent', logs);
      refetch();
      revalidatePath('/');
    },
  });

  if (!activeAuction) {
    return (
      <VStack
        shadow={'sm'}
        w={'full'}
        height='full'
        padding={4}
        rounded={'md'}
        gap={4}
        _dark={{ borderColor: 'yellow', borderWidth: 1 }}
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          align={'start'}
          justify={'space-between'}
          w={'full'}
        >
          <VStack align={'stretch'} gap={2} w={'full'}>
            <Heading as='h2'>
              <Skeleton height='40px' width='160px' />
            </Heading>
            <Text>
              <Skeleton height='20px' width='100px' />
            </Text>
            <Text>
              <Skeleton height='20px' width='80px' />
            </Text>
          </VStack>
          <Skeleton
            rounded={'md'}
            w={'full'}
            maxW={{ md: '240px' }}
            height='240px'
          />
        </Stack>
      </VStack>
    );
  }

  const auctionEndedAt = new Date(parseInt(activeAuction.endTime) * 1000);
  const isAuctionRunning = parseInt(activeAuction.endTime) * 1000 > Date.now();
  console.log({ activeAuction });

  return (
    <VStack
      shadow={'sm'}
      w={'full'}
      height='full'
      padding={4}
      rounded={'md'}
      gap={4}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={'start'}
        justify={'space-between'}
        w={'full'}
      >
        <Image
          asChild
          rounded={'md'}
          w={'full'}
          height={'100%'}
          mt={0.5}
          maxW={{ md: '55%' }}
        >
          <NextImage
            width={1024}
            height={1024}
            src={activeAuction.token.image}
            alt={`Auction token id ${activeAuction.token.tokenId}`}
          />
        </Image>
        <VStack align={'stretch'} gap={2} w={'full'} h={'full'}>
          <VStack align={'start'} gap={1} h={'full'}>
            <Heading as='h2' fontSize={'2xl'} mt={'auto'} mb={2}>
              Auction #{activeAuction.token.tokenId}
            </Heading>
            {activeAuction.highestBid ? (
              <>
                <HStack gap={1}>
                  <FaUser size={12} />
                  <FormattedAddress
                    address={activeAuction.highestBid.bidder}
                    textBefore={isAuctionRunning ? 'Highest bid' : 'Winner'}
                  />
                </HStack>
                <HStack gap={1}>
                  <FaEthereum size={12} style={{ scale: '1.3' }} />
                  <Text>Highest bid </Text>
                  <Badge colorPalette={'blue'} variant={'surface'} size={'sm'}>
                    ✧{weiToSparks(activeAuction.highestBid.amount)}{' '}
                  </Badge>
                </HStack>
                {isAuctionRunning ? (
                  <HStack gap={1}>
                    <LuClock size={12} />
                    <Text>
                      Time left{' '}
                      <Countdown
                        date={parseInt(activeAuction.endTime) * 1000}
                        daysInHours={false}
                      />
                    </Text>
                  </HStack>
                ) : (
                  <HStack gap={1}>
                    <FaBirthdayCake size={12} />
                    <Text>
                      Born at{' '}
                      {auctionEndedAt.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </HStack>
                )}
              </>
            ) : isAuctionRunning ? (
              <HStack gap={1}>
                <LuSparkles size={12} />
                <Text>Place the first bid</Text>
              </HStack>
            ) : (
              <HStack gap={1}>
                <BsEmojiAstonished size={12} />
                <Text>No bids</Text>
              </HStack>
            )}
          </VStack>
          <Box mt={4}>
            <AuctionBid
              tokenId={BigInt(activeAuction.token.tokenId)}
              winningBid={
                activeAuction.winningBid
                  ? BigInt(activeAuction.winningBid.amount)
                  : 0n
              }
              isAuctionRunning={isAuctionRunning}
              onBid={refetch}
              onSettle={refetch}
            />
          </Box>
        </VStack>
      </Stack>
    </VStack>
  );
}
