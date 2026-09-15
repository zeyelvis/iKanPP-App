import { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';
import { SearchHistoryDropdown } from '@/components/search/SearchHistoryDropdown';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { useSearchBoxHandlers } from './hooks/useSearchBoxHandlers';

interface SearchBoxProps {
    onSearch: (query: string) => void;
    onClear?: () => void;
    initialQuery?: string;
    placeholder?: string;
    isPremium?: boolean;
}

export function SearchBox({ onSearch, onClear, initialQuery = '', placeholder = '搜索电影、电视剧、综艺...', isPremium = false }: SearchBoxProps) {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    // Search history hook
    const {
        searchHistory,
        isDropdownOpen,
        highlightedIndex,
        showDropdown,
        hideDropdown,
        addSearch,
        removeSearch,
        clearAll,
        selectHistoryItem,
        navigateDropdown,
        resetHighlight,
    } = useSearchHistory((selectedQuery) => {
        setQuery(selectedQuery);
        onSearch(selectedQuery);
        // Blur the input after selecting from history
        inputRef.current?.blur();
    }, isPremium);

    // Update query when initialQuery changes
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const {
        handleSubmit,
        handleClear,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    } = useSearchBoxHandlers({
        query,
        setQuery,
        onSearch,
        onClear,
        inputRef,
        isDropdownOpen,
        highlightedIndex,
        searchHistory,
        addSearch,
        hideDropdown,
        showDropdown,
        resetHighlight,
        selectHistoryItem,
        navigateDropdown,
    });

    return (
        <form onSubmit={handleSubmit} className="relative group w-full max-w-[220px] md:max-w-[260px] lg:max-w-[300px] xl:max-w-[380px] 2xl:max-w-[440px]" style={{ isolation: 'isolate' }}>
            <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="text-xs sm:text-sm xl:text-base pr-16 sm:pr-24 md:pr-32 xl:pr-40 truncate h-9 sm:h-10 xl:h-11"
                aria-label="搜索视频内容"
                aria-expanded={isDropdownOpen}
                aria-controls="search-history-dropdown"
                aria-autocomplete="list"
                data-focusable
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 sm:p-2 text-[var(--text-color)] opacity-70 hover:opacity-100 transition-opacity touch-manipulation cursor-pointer"
                        aria-label="清除搜索"
                    >
                        <Icons.X size={16} className="sm:w-5 sm:h-5" />
                    </button>
                )}
                <Button
                    type="submit"
                    disabled={!query.trim()}
                    variant="primary"
                    className="px-2.5 sm:px-4 md:px-6 !min-h-0 h-7 sm:h-[44px] py-1 sm:py-2.5 text-xs sm:text-sm rounded-full sm:rounded-[var(--radius-2xl)]"
                >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <Icons.Search size={14} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">搜索</span>
                    </span>
                </Button>
            </div>

            {/* Search History Dropdown */}
            <SearchHistoryDropdown
                isOpen={isDropdownOpen}
                searchHistory={searchHistory}
                highlightedIndex={highlightedIndex}
                triggerRef={inputRef}
                onSelectItem={selectHistoryItem}
                onRemoveItem={removeSearch}
                onClearAll={clearAll}
            />
        </form>
    );
}
