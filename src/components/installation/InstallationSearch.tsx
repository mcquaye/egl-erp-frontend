import { useState } from "react";
import { useLazyGetInstallationFormQuery } from "../../redux/api/installationApi";
import { InstallationItem } from "../../types";
import { toast } from "sonner";

interface InstallationSearchProps {
	onResultsFound?: (data: InstallationItem[]) => void;
	className?: string;
}

export default function InstallationSearch({
	onResultsFound,
	className = "",
}: InstallationSearchProps) {
	const [serialNumber, setSerialNumber] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<InstallationItem[]>([]);
	const [lastSearchedSerial, setLastSearchedSerial] = useState("");

	// Use lazy query for manual triggering
	const [triggerSearch] = useLazyGetInstallationFormQuery();

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!serialNumber.trim()) {
			toast.error("Please enter a serial number");
			return;
		}

		setIsSearching(true);
		setLastSearchedSerial(serialNumber);

		try {
			const result = await triggerSearch(serialNumber.trim()).unwrap();

			if (result.data && result.data.length > 0) {
				setSearchResults(result.data);
				onResultsFound?.(result.data);
				toast.success(`Found ${result.data.length} installation(s) for serial: ${serialNumber}`);
			} else {
				setSearchResults([]);
				toast.warning(`No installations found for serial: ${serialNumber}`);
			}
		} catch (err: any) {
			console.error("Search error:", err);
			setSearchResults([]);
			toast.error(err?.data?.error || "Failed to search for installations");
		} finally {
			setIsSearching(false);
		}
	};

	const handleClearSearch = () => {
		setSerialNumber("");
		setSearchResults([]);
		setLastSearchedSerial("");
	};

	return (
		<div className={`w-full ${className}`}>
			{/* Search Form */}
			<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
				<div className='mb-4'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Search Installation
					</h3>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Enter a serial number to search for installation data
					</p>
				</div>

				<form onSubmit={handleSearch} className='space-y-4'>
					<div className='flex gap-3'>
						<div className='flex-1'>
							<label htmlFor='serialNumber' className='sr-only'>
								Serial Number
							</label>
							<input
								id='serialNumber'
								type='text'
								value={serialNumber}
								onChange={(e) => setSerialNumber(e.target.value)}
								placeholder='Enter serial number (e.g., SN123456)'
								className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400'
								disabled={isSearching}
								autoComplete='off'
							/>
						</div>
						<button
							type='submit'
							disabled={isSearching || !serialNumber.trim()}
							className='rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
							{isSearching ? (
								<div className='flex items-center gap-2'>
									<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
									Searching...
								</div>
							) : (
								"Search"
							)}
						</button>
						{(serialNumber || searchResults.length > 0) && (
							<button
								type='button'
								onClick={handleClearSearch}
								className='rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors'>
								Clear
							</button>
						)}
					</div>
				</form>
			</div>

			{/* Search Results */}
			{searchResults.length > 0 && (
				<div className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='mb-4 flex items-center justify-between'>
						<h4 className='text-lg font-semibold text-gray-900 dark:text-white'>Search Results</h4>
						<span className='rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
							{searchResults.length} found
						</span>
					</div>

					<div className='space-y-4'>
						{searchResults.map((item, index) => (
							<div
								key={index}
								className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
									{/* Customer Information */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Customer:</span>
										<p className='text-gray-900 dark:text-white'>{item.customer_name}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Customer Code:
										</span>
										<p className='text-gray-900 dark:text-white font-mono'>{item.custcode}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Contact Person:
										</span>
										<p className='text-gray-900 dark:text-white'>{item.contact_person}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Phone:</span>
										<p className='text-gray-900 dark:text-white'>{item.contact_number}</p>
									</div>
									{item.email && (
										<div>
											<span className='font-medium text-gray-700 dark:text-gray-300'>Email:</span>
											<p className='text-gray-900 dark:text-white'>{item.email}</p>
										</div>
									)}

									{/* Invoice Information */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Invoice No:
										</span>
										<p className='text-gray-900 dark:text-white font-mono'>{item.invoice_no}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Invoice Date:
										</span>
										<p className='text-gray-900 dark:text-white'>
											{new Date(item.invoice_date).toLocaleDateString()}
										</p>
									</div>

									{/* Delivery Information */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Delivery No:
										</span>
										<p className='text-gray-900 dark:text-white font-mono'>{item.delivery_no}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Delivery Date:
										</span>
										<p className='text-gray-900 dark:text-white'>
											{new Date(item.delivery_date).toLocaleDateString()}
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Quantity:</span>
										<p className='text-gray-900 dark:text-white'>{item.qty}</p>
									</div>

									{/* Product Information */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Item Code:</span>
										<p className='text-gray-900 dark:text-white font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'>
											{item.item_code}
										</p>
									</div>
									<div className='md:col-span-2'>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Description:
										</span>
										<p className='text-gray-900 dark:text-white'>{item.description}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Serial No:</span>
										<p className='text-gray-900 dark:text-white font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded'>
											{item.serial_no}
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Brand:</span>
										<p className='text-gray-900 dark:text-white'>{item.brand}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Group:</span>
										<p className='text-gray-900 dark:text-white'>{item.group}</p>
									</div>

									{/* Classification & Categories */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Classification:
										</span>
										<p className='text-gray-900 dark:text-white'>{item.classification}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Sub Group:</span>
										<p className='text-gray-900 dark:text-white'>{item.sub_group}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Sub Sub Group:
										</span>
										<p className='text-gray-900 dark:text-white'>{item.sub_sub_group}</p>
									</div>

									{/* System Information */}
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Branch:</span>
										<p className='text-gray-900 dark:text-white'>{item.branch}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Username:</span>
										<p className='text-gray-900 dark:text-white'>{item.username}</p>
									</div>
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Company Code:
										</span>
										<p className='text-gray-900 dark:text-white font-mono'>{item.comp_code}</p>
									</div>

									{/* Optional Fields */}
									{item.sup_item_code && (
										<div>
											<span className='font-medium text-gray-700 dark:text-gray-300'>
												Supplier Item Code:
											</span>
											<p className='text-gray-900 dark:text-white font-mono'>
												{item.sup_item_code}
											</p>
										</div>
									)}
									{item.item_size && (
										<div>
											<span className='font-medium text-gray-700 dark:text-gray-300'>
												Item Size:
											</span>
											<p className='text-gray-900 dark:text-white'>{item.item_size}</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* No Results Message */}
			{lastSearchedSerial && searchResults.length === 0 && !isSearching && (
				<div className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='text-center py-8'>
						<div className='mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
							<svg
								className='w-8 h-8 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
								/>
							</svg>
						</div>
						<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
							No Results Found
						</h3>
						<p className='text-gray-600 dark:text-gray-400'>
							No installations found for serial number "
							<span className='font-mono'>{lastSearchedSerial}</span>".
							<br />
							Please check the serial number and try again.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
