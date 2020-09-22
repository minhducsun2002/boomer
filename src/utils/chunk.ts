// https://stackoverflow.com/questions/8495687/split-array-into-chunks
/**
 * Slice an array into smaller chunks 
 * @param array Array to chunk
 * @param chunk_size Size of each chunk
 */
export function chunk <T>(array: T[], chunk_size: number)  {
    let chunkCount = Math.ceil(array.length / chunk_size);
    let baseArray = Array(chunkCount).fill(undefined);
    return baseArray
            .map((_, index) => index * chunk_size)
            .map(begin => array.slice(begin, begin + chunk_size));
}