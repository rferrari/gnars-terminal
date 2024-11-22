import { gql } from '@apollo/client';
import apolloClient from '@/utils/apollo';
import { Address } from 'viem';

export interface Proposal {
  proposalId: string;
  proposalNumber: number;
  title: string;
  proposer: Address;
  timeCreated: string;
  againstVotes: number;
  voteCount: number;
  quorumVotes: string;
  forVotes: number;
  abstainVotes: number;
  voteStart: string;
  voteEnd: string;
  queued: boolean;
  executed: boolean;
  canceled: boolean;
  vetoed: boolean;
  description: string;
}

const GET_DATA = gql`
  query Proposals(
    $where: Proposal_filter
    $orderBy: Proposal_orderBy
    $orderDirection: OrderDirection
    $first: Int
  ) {
    proposals(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
    ) {
      proposalId
      proposalNumber
      title
      proposer
      timeCreated
      quorumVotes
      againstVotes
      forVotes
      abstainVotes
      voteStart
      voteEnd
      queued
      executed
      canceled
      vetoed
      voteCount
      description
    }
  }
`;

export async function fetchProposals(
  address: string,
  orderBy: string,
  orderDirection: string,
  first: number
) {
  const where = { dao: address.toLocaleLowerCase() };

  try {
    const { data } = await apolloClient.query({
      query: GET_DATA,
      variables: {
        where,
        orderBy,
        orderDirection,
        first,
      },
    });

    return data.proposals as Proposal[];
  } catch (error) {
    throw new Error('Erro ao consultar propostas');
  }
}
