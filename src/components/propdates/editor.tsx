import { PropDateInterface } from '@/utils/database/interfaces';
import { Textarea, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';

interface FormData {
  content: string;
}

interface PropdatesEditorProps {
  propdateId: string;
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
}

function PropdatesEditor({ propdateId, setPropdates }: PropdatesEditorProps) {
  const { control, handleSubmit } = useForm<FormData>();
  const { address } = useAccount();

  const onSubmit = async (data: FormData) => {
    console.log('Submitted update:', data);
    const res = await fetch('/api/propdates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposal: propdateId,
        text: data.content,
        author: address,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create propdate');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setPropdates((prevPropdates) => [...res.data, ...prevPropdates]);
    console.log('Response:', res);
  };

  return (
    <VStack align={'end'} gap={2} w={'full'} asChild>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='content'
          control={control}
          defaultValue=''
          rules={{ required: 'Update content is required' }}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              placeholder='Write your proposal updates'
              minH={'140px'}
            />
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </VStack>
  );
}

export default PropdatesEditor;
