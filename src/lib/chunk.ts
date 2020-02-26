// https://stackoverflow.com/questions/8495687/split-array-into-chunks
export const chunk = 
    <T>(array: T[], chunk_size: number) => 
        Array(Math.ceil(array.length / chunk_size))
            .fill(undefined)
            .map((_, index) => index * chunk_size)
            .map(begin => array.slice(begin, begin + chunk_size));