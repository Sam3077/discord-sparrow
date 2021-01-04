import PirateBay from 'thepiratebay';

export default class SearchClient {
    private index: number;
    private searchPage: number;
    private results: PirateBay.TorrentSearchResult[];
    private searchTerm: string;
    private hasNext: boolean;
    private pageSize: number;
    public ready: Promise<boolean>;

    constructor(searchTerm: string, pageSize: number) {
        this.index = 0;
        this.results = [];
        this.searchTerm = searchTerm;
        this.searchPage = 0;
        this.hasNext = true;
        this.pageSize = pageSize;
        if (pageSize > 10) {
            throw "Page size must be less than 10"
        }
        this.ready = this.doRequest();
    }

    private doRequest: () => Promise<boolean> = async () => {
        const result = await PirateBay.search(this.searchTerm, {
            page: this.searchPage,
            category: 'video'
        });
        this.results = this.results.concat(result);
        return result.length > 0;
    }

    public current: () => PirateBay.TorrentSearchResult[] = () => {
        const endIndex = Math.min(this.index + this.pageSize, this.results.length);
        return this.results.slice(this.index, endIndex);;
    }

    public next: () => Promise<PirateBay.TorrentSearchResult[]> = async () => {
        let nextIndex = this.index + this.pageSize;
        // if we're out of results, try to grab some more
        if (nextIndex > this.results.length) {
            if (this.hasNext) {
                this.searchPage++;
                this.hasNext = await this.doRequest();
            } 
            nextIndex = Math.min(nextIndex, this.results.length);
        }
        this.index = nextIndex;
        return this.current();
    }

    public previous: () => PirateBay.TorrentSearchResult[] = () => {
        this.index = Math.max(0, this.index - this.pageSize);
        const endIndex = Math.min(this.index + this.pageSize, this.results.length);
        return this.results.slice(this.index, endIndex);
    }

    public getHasNext = () => this.hasNext;
    public setPageSize = (newSize: number)  => {
        if (newSize > 10) {
            throw "Page size must be less than 10"
        }
        this.pageSize = newSize;
    }
    public getDisplayPageNumber = () => Math.floor(this.index / this.pageSize) + 1;
}